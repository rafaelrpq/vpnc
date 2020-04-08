//Icons made by https://www.flaticon.com/authors/smashicons

/*
    Este programa implementa uma interface para conexão vpn para acesso a rede da unipampa e seus TAEs/Profs

    versão inicial ainda sem arquivo de configuração, ainda é necessário criar/editar o arquivo .conf que sera
    lido pelo programa vpnc
*/

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
        default_height : 150,
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

    text.set_markup ('<big>'+_text+'</big>');
    // text.set_text (_text);

    let settings = Gtk.Settings.get_default();

    settings.gtk_application_prefer_dark_theme  = false;

    let img = new Gtk.Image()
    let icon = (vpnc ()) ? 'channel-secure-symbolic' : 'dialog-warning';
    img.set_from_icon_name (icon, Gtk.IconSize.DIALOG);

    let grid = new Gtk.Grid ();
    grid.set_column_homogeneous (true);
    grid.set_row_homogeneous (false);
    grid.set_row_spacing (20);
    grid.attach (new Gtk.Label(),  1, 1, 12, 1)
    grid.attach (img,  1, 2, 4, 1)
    grid.attach (text, 2, 2, 10, 1)
    let msg = new Gtk.Label ();
    grid.attach(msg, 1, 4, 12, 1);
    // grid.attach (btn, 1, 2, 12, 1)

    // … which closes the window when clicked
    btn.connect ('clicked', () => {
        if (vpnc()) {
            let [success, output, error, status] = GLib.spawn_command_line_sync ( "pkexec vpnc-disconnect");
            if (status == 0) {
                btn.label = 'Conectar';
                text.set_markup ("<big>A VPN não está conectada\n\nVocê não possui acesso a rede da UNIPAMPA</big>");
                img.set_from_icon_name ('dialog-warning', Gtk.IconSize.DIALOG);
                ctx.remove_class ("destructive-action");
                ctx.add_class ("suggested-action");
                return ;
            } else {
               // let info = new Gtk.InfoBar();
               // let msg = new Gtk.Label (error);
               // let content = info.get_content_area();
               // content.container_add (msg);
               // info.set_show_close_button (true);
               // info.set_revealed (true);
               // info.set_message_type (Gtk.MessageType.ERROR);
               // info.connect ("response", () => {
               //     Gtk.Widget.destroy();
               // })
               // grid.attach(info,0,0,1,1);
               // info.show_all();
               print (error)
            }
        } else {
            msg.set_markup ('<i>Conectando...</i>');
            let [success, output, error, status] = GLib.spawn_command_line_sync ( "pkexec vpnc myconf.conf");
            if (status == 0) {
                btn.label = 'Desconectar';
                text.set_markup ("<big>A VPN está ativa\n\nVocê está conectado a UNIPAMPA</big>");
                img.set_from_icon_name ('channel-secure-symbolic', Gtk.IconSize.DIALOG);
                ctx.remove_class ("suggested-action");
                ctx.add_class ("destructive-action");
                msg.set_text ('');
                return ;
            } else {
                msg.set_markup ('<i>'+error.toString().trim()+'</i>');
            }
        }
    });

    win.add (grid);
    header.pack_end(btn);

    win.show_all();
});

app.run([]);
