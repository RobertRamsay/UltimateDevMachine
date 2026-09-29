for (var _i = 0; _i < 3; ++_i) {
    if (keyboard_check_pressed(ord("1") + _i)) {
        selected = _i;
        requested_mhz = 0;
    }
}
if (keyboard_check_pressed(ord("S"))) {
    requested_mhz = requested_mhz == 0 ? profiles[selected].maximum : 0;
}
if (keyboard_check_pressed(ord("B"))) {
    try {
        status_text = "Built: " + ue_build(selected, requested_mhz);
    } catch (_error) {
        status_text = "Build failed: " + string(_error);
    }
}
