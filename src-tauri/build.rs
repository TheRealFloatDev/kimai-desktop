fn main() {
    tauri_build::build();
    render_tray_icon();
}

fn render_tray_icon() {
    let svg_path = "icons/tray-icon-white.svg";
    let out_path = "icons/tray-icon.png";
    println!("cargo:rerun-if-changed={svg_path}");

    let svg_data = std::fs::read_to_string(svg_path).expect("read tray svg");
    let mut opt = usvg::Options::default();
    opt.fontdb_mut().load_system_fonts();
    let tree = usvg::Tree::from_str(&svg_data, &opt).expect("parse tray svg");

    let size = 44u32;
    let scale = size as f32 / tree.size().width().max(tree.size().height());
    let transform = tiny_skia::Transform::from_scale(scale, scale);
    let mut pixmap = tiny_skia::Pixmap::new(size, size).expect("pixmap");
    pixmap.fill(tiny_skia::Color::TRANSPARENT);
    resvg::render(&tree, transform, &mut pixmap.as_mut());

    let png = pixmap.encode_png().expect("encode png");
    std::fs::write(out_path, png).expect("write tray png");
}
