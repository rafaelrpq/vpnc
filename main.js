imports.gi.versions['Gtk'] = '3.0';
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;

// Create a new application
let app = new Gtk.Application ({ application_id: 'com.github.rafaelrpq.vpnc' });


// When the application is launched…
app.connect ('activate', () => {
    var header = new Gtk.HeaderBar ({
        title             : 'Conexão VPN UNIPAMPA',
        subtitle          : 'gtkheaderbar',
        show_close_button :  true
    });

    // … create a new window …
    let win = new Gtk.ApplicationWindow ({
        application    : app,
        default_height : 250,
        default_width  : 600,
        resizable     : false
    });

    var fix = new Gtk.Fixed();

    win.set_titlebar (header);

    // … with a button in it …
    let btn = new Gtk.Button({
        label: 'Conectar'
    });


    var success = false;
    var output  = null;
    var error   = null;
    var status  = -1;

    // … which closes the window when clicked
    btn.connect ('clicked', () => {
        if (status != 0) {
            btn.label = "Desconectar";
            [success, output, error, status] = GLib.spawn_command_line_sync ( "pkexec vpnc myconf.conf");
            print (status);
            return ;
        }
        if (status == 0) {
            btn.label = "Conectar";
            status = -1;
            print (status);
            GLib.spawn_command_line_sync ( "pkexec vpnc-disconnect");
            return ;
        }
    });

    print([success, output, error, status]);
    win.add (fix);

    fix.put (btn, 40,40);

    win.show_all();
});

app.run([])
