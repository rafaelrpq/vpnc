imports.gi.versions['Gtk'] = '3.0';
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const Pango = imports.gi.Pango;

// Create a new application
let app = new Gtk.Application ({ application_id: 'com.github.rafaelrpq.vpnc' });

var vpnc = function () {
   return GLib.file_test ('/var/run/vpnc.pid', GLib.FileTest.EXISTS);
};


// When the application is launched…
app.connect ('activate', () => {
    var header = new Gtk.HeaderBar ({
        title             : 'Conexão VPN UNIPAMPA',
        subtitle          : 'Acesso aos recuros da rede do Campus',
        show_close_button :  true
    });

    // … create a new window …
    let win = new Gtk.ApplicationWindow ({
        application    : app,
        default_height : 250,
        default_width  : 600,
        resizable     : false
    });

    win.set_titlebar (header);

    var _label = (vpnc()) ? 'Desconectar' : 'Conectar';

    // … with a button in it …
    let btn = new Gtk.Button({
        label: _label
    });

    btn.set_size_request(120, 30);

    let ctx = new Gtk.StyleContext ();
    ctx = btn.get_style_context();
    var className = (vpnc()) ? "destructive-action" : "suggested-action";
    ctx.add_class (className);

    let _text = (vpnc()) ? "A VPN está ativa\n\nVocê está conectado a UNIPAMPA" : "A VPN não está conectada\n\nVocê não possui acesso a rede da UNIPAMPA";

    let text = new Gtk.Label ();
    text.set_justify (Gtk.Justification.CENTER)

    text.set_text (_text);
    // … which closes the window when clicked
    btn.connect ('clicked', () => {
        if (vpnc()) {
            let [success, output, error, status] = GLib.spawn_command_line_sync ( "pkexec vpnc-disconnect");
            if (status == 0) {
                btn.label = 'Conectar';
                text.set_text ("A VPN não está conectada\n\nVocê não possui acesso a rede da UNIPAMPA");
                ctx.remove_class ("destructive-action");
                ctx.add_class ("suggested-action");
                return ;
            } else {
               print (error);
            }
        } else {
            let [success, output, error, status] = GLib.spawn_command_line_sync ( "pkexec vpnc myconf.conf");
            if (status == 0) {
                btn.label = 'Desconectar';
                text.set_text ("A VPN está ativa\n\nVocê está conectado a UNIPAMPA");
                ctx.remove_class ("suggested-action");
                ctx.add_class ("destructive-action");
                return ;
            } else {
                print (error);
            }
        }
    });

    let settings = Gtk.Settings.get_default();

    settings.gtk_application_prefer_dark_theme  = false;

    let img = new Gtk.Image()
    img.set_from_icon_name ('dialog-warning',Gtk.IconSize.DIALOG);
    // img.set_from_icon_name ('channel-secure-symbolic',Gtk.IconSize.DIALOG);

    let grid = new Gtk.Grid ();
    grid.set_column_homogeneous (true);
    grid.set_row_homogeneous (true);
    grid.attach (img, 1, 1, 4, 1)
    grid.attach (text, 2, 1, 10, 1)

    win.add (grid);
    header.pack_end(btn);

    win.show_all();
});

app.run([]);
