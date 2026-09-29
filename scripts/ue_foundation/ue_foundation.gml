/// Assemble the shared relocation recipe in the GameMaker host.
function ue_assemble(_recipe) {
    var _labels = {};
    var _pc = $0801;
    for (var _i = 0; _i < array_length(_recipe); ++_i) {
        var _row = _recipe[_i];
        switch (_row[0]) {
            case "label":
                if (variable_struct_exists(_labels, _row[1])) throw "Duplicate label";
                variable_struct_set(_labels, _row[1], _pc);
                break;
            case "b": _pc += array_length(_row) - 1; break;
            case "abs": _pc += 3; break;
            case "rel": _pc += 2; break;
            default: throw "Unknown recipe operation";
        }
    }
    if (_pc > $3000) throw "Runtime overlaps scratch RAM";
    var _out = buffer_create(_pc - $0801 + 2, buffer_fixed, 1);
    try {
        buffer_write(_out, buffer_u16, $0801);
        _pc = $0801;
        for (var _i = 0; _i < array_length(_recipe); ++_i) {
            var _row = _recipe[_i];
            if (_row[0] == "label") continue;
            if (_row[0] == "b") {
                for (var _j = 1; _j < array_length(_row); ++_j) {
                    var _v = _row[_j];
                    if (_v < 0 || _v > 255 || floor(_v) != _v) throw "Invalid byte";
                    buffer_write(_out, buffer_u8, _v);
                    ++_pc;
                }
            } else {
                if (!variable_struct_exists(_labels, _row[2])) throw "Unresolved label";
                var _address = variable_struct_get(_labels, _row[2]);
                buffer_write(_out, buffer_u8, _row[1]);
                if (_row[0] == "abs") {
                    buffer_write(_out, buffer_u16, _address);
                    _pc += 3;
                } else {
                    var _delta = _address - _pc - 2;
                    if (_delta < -128 || _delta > 127) throw "Branch out of range";
                    buffer_write(_out, buffer_u8, _delta & 255);
                    _pc += 2;
                }
            }
        }
    } catch (_error) {
        buffer_delete(_out);
        throw _error;
    }
    return _out;
}

function ue_read_recipe() {
    var _buffer = buffer_load("foundation.json");
    if (_buffer < 0) throw "Missing foundation.json included file";
    var _text = buffer_read(_buffer, buffer_text);
    buffer_delete(_buffer);
    return json_parse(_text);
}

function ue_profiles() {
    return [
        { id: "c64_ultimate", title: "Commodore 64 Ultimate", maximum: 64 },
        { id: "commodore_77", title: "Commodore 77", maximum: 77 },
        { id: "vice", title: "VICE development", maximum: 0 }
    ];
}

function ue_build(_target, _requested_mhz) {
    var _profile = ue_profiles()[_target];
    var _buffer = ue_assemble(ue_read_recipe());
    var _filename = "foundation-" + _profile.id + ".prg";
    buffer_save(_buffer, _filename);
    buffer_delete(_buffer);
    var _manifest = {
        schema_version: 1, target: _profile.id,
        requested_cpu_mhz: _requested_mhz,
        cpu_policy: "preserve_current", turbo_control_implemented: false,
        hardware_verified: false, reu_capacity_bytes: -1,
        diagnostic: "foundation-0.1"
    };
    var _file = file_text_open_write("foundation-" + _profile.id + ".json");
    file_text_write_string(_file, json_stringify(_manifest));
    file_text_close(_file);
    return save_directory + _filename;
}
