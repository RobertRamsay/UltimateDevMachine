profiles = ue_profiles();
selected = 0;
requested_mhz = 0;
status_text = "Ready to build the native startup and REU diagnostic.";
display_set_gui_size(1366, 768);
window_set_caption("C64 Ultimate Engine | Runtime Foundation");

// A command-line smoke check runs the real GML assembler without UI input.
for (var _arg = 1; _arg <= parameter_count(); ++_arg) {
    if (parameter_string(_arg) == "--foundation-selftest" && _arg < parameter_count()) {
        var _out = ue_assemble(ue_read_recipe());
        buffer_save(_out, parameter_string(_arg + 1));
        buffer_delete(_out);
        game_end();
    }
}
