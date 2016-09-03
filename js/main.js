function get_mouse_pos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function RenderEngine(canvas) {
    var context = canvas.getContext('2d');
    this.renderer_object_list = [];

    this.background_color = "#4c4c4c"

    this.render_one_frame = function() {

        context.clearRect(0, 0, canvas.width, canvas.height);

        this.renderer_object_list.forEach(function(render_object) {
            if (render_object.visible) {
                render_object.render(context)
            }
        });
    }
}

function RendererObject() {
    this.position = {
        x: 0,
        y: 0
    };

    this.visible = true;
    this.z = 0;
}

function TextRenderObject() {
    RendererObject.apply(this, arguments);

    this.text;
    this.horizontal_align = "left";
    this.vertical_align = "center";
	this.color = "#ffffff";
    this.font = "22px Poiret One"

    this.render = function(context) {

		context.fillStyle = this.color
		context.textBaseline = this.vertical_align;
        context.textAlign = this.horizontal_align;
        context.font = this.font;

        context.fillText(this.text, this.position.x, this.position.y);
    }
}

function RectangleRenderObject() {
    RendererObject.apply(this, arguments);

    this.width = 20;
    this.height = 20;
    this.background_color = "rgba(0,0,0,0)";
    this.border_color = "#000000";

    this.render = function(context) {
        context.strokeStyle = this.border_color;
        context.fillStyle = this.background_color;
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
}

function CellGameObject(renderer_engine, number) {
    var position = {
        x: 0,
        y: 0
    }
    var size = {
        width: 40,
        height: 40
    }

    var strikeout = false;
    var selected = false;

    var border_renderable = new RectangleRenderObject();

    border_renderable.position = position;
    border_renderable.height = size.height;
    border_renderable.width = size.width;
	border_renderable.background_color = "#795548"
	border_renderable.border_color = "#5D4037"

    var label_renderable = new TextRenderObject();
    label_renderable.position = position;
    label_renderable.text = number;
	label_renderable.color = "#ffffff";
    label_renderable.horizontal_align = "center";
	label_renderable.vertical_align = "middle";

    renderer_engine.renderer_object_list.push(border_renderable);
    renderer_engine.renderer_object_list.push(label_renderable);

    this.set_strikeout = function(_strikeout) {
        strikeout = _strikeout;

        label_renderable.visible = !strikeout;
        border_renderable.background_color = strikeout ? "#ffffff" : "#5D4037";
    }

    this.set_selected = function(_selected) {
        selected = _selected;

        label_renderable.visible = true;
        border_renderable.background_color = selected ? "#FF5722" : "#795548";
    }

    this.is_strikeout = function() {
        return strikeout;
    }

    this.set_position = function(_position) {
        position = _position;

        border_renderable.position = position;
        label_renderable.position = {
            x: position.x + size.width / 2,
            y: position.y + size.height / 2
        }
	}

    this.get_number = function() {
        return number;
    }

    this.is_contains = function(point) {

        if (point.x >= position.x && point.x <= (position.x + size.width) &&
            point.y >= position.y && point.y <= (position.y + size.height)) {
            return true;
        }
        return false;
    }
}

function GameGrid() {
    var grid = [
        []
    ];
    var element_size = 40;

    var margin = 10;
    var spacing = 5;

    this.clear = function() {
        grid = [
            []
        ];
    }

    this.add_game_object = function(game_object) {

        if (grid.length == 0) {
            grid.push([]);
        }

        var row_index = grid.length - 1;

        if (grid[row_index].length == 9) {
            grid.push([]);
            ++row_index;
        }

        grid[row_index].push(game_object);

        var element_offset = element_size + spacing;

        var position = {
            x: (grid[row_index].length - 1) * element_offset + margin,
            y: element_offset * row_index + margin
        }

        game_object.grid_index = {
            row: row_index,
            col: grid[row_index].length - 1
        };

        game_object.set_position(position);
    }

    this.get_object = function(row, col) {
        return grid[row][col];
    }

    this.bounding_box = function() {

        var g_height = (element_size * grid.length) + (spacing * Math.max(0, grid.length - 1)) + 2 * margin;
        var g_width = (element_size * 9) + (spacing * 8) + 2 * margin;

        var result = {
            x: 0,
            y: 0,
            height: g_height,
            width: g_width
        }

        return result;
    }
}

function Game(game_canvas) {
    var self = this

    this.render_engine = new RenderEngine(game_canvas);
	this.render_engine.background_color = "#fcfcfc"

    var selected_pair = {
        first: null,
        second: null
    }

    game_canvas.addEventListener('mouseup', function(evt) {
        var mouse_pos = get_mouse_pos(game_canvas, evt);

        game_object_list.forEach(function(object) {
            if (object.is_contains(mouse_pos)) {

                if (object.is_strikeout()) {
                    return;
                }

                if (object == selected_pair.first) {
                    object.set_selected(false);
                    selected_pair.first = null;
                    return;
                }

                if (!selected_pair.first) {
                    selected_pair.first = object;
                    object.set_selected(true);
                } else {
                    if (check_game_rules(selected_pair.first, object)) {
                        selected_pair.first.set_selected(false);
                        selected_pair.first.set_strikeout(true);
                        object.set_strikeout(true);
                        selected_pair.first = null;
                    } else {
                        selected_pair.first.set_selected(false);
                        selected_pair.first = null;
                    }
                }

                return;
            }
        })

        self.render_engine.render_one_frame();

    }, false);

    var game_object_list = [];
    var game_context = game_canvas.getContext('2d');

    var game_grid = new GameGrid()

    function get_possible_cells() {
        var result = [];
        game_object_list.forEach(function(object) {

            if (!object.is_strikeout()) {
                result.push(object);
            }
        });

        return result;
    }

    function check_game_rules(first_object, second_object) {

        function check_numbers(f, s) {

            if (f.get_number() == s.get_number()) {
                return true;
            }

            if (f.get_number() + s.get_number() == 10) {
                return true;
            }

            return false;
        }

        var list_possible_objects = get_possible_cells();

        var f_index = list_possible_objects.indexOf(first_object);
        var s_index = list_possible_objects.indexOf(second_object);

        if (Math.abs(f_index - s_index) == 1) {
            return check_numbers(first_object, second_object);
        }

        if (f_index == 0 && s_index == list_possible_objects.length - 1) {
            return check_numbers(first_object, second_object);
        }

        if (s_index == 0 && f_index == list_possible_objects.length - 1) {
            return check_numbers(first_object, second_object);
        }

        if (first_object.grid_index.col == second_object.grid_index.col) {

            var begin_index = Math.min(first_object.grid_index.row, second_object.grid_index.row);
            var end_index = Math.max(first_object.grid_index.row, second_object.grid_index.row);

            var middle_strikeout = true;

            for (var i = begin_index + 1; i < end_index; ++i) {
                if (!game_grid.get_object(i, first_object.grid_index.col).is_strikeout()) {
                    middle_strikeout = false;
                    break;
                }
            }

            if (middle_strikeout) {
                return check_numbers(first_object, second_object);
            }
        }

        return false;
    }

    this.create_new_game = function() {

        game_grid.clear();
        game_object_list = [];
        this.render_engine.renderer_object_list = [];

        var start_sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9]

        for (var i = 0; i < start_sequence.length; ++i) {
            var game_object = new CellGameObject(this.render_engine, start_sequence[i]);
            game_object_list.push(game_object);

            game_grid.add_game_object(game_object);
        }

        button_repeat_cells.style.display = "inline";
        game_singlethon.render_one_frame();
    }

    this.repeat_cells = function() {
        var list_objects = get_possible_cells();

        list_objects.forEach(function(object) {
            var clone_object = new CellGameObject(self.render_engine, object.get_number());
            game_grid.add_game_object(clone_object);
            game_object_list.push(clone_object);
        })

        this.render_one_frame();
    }

    this.resize_canvas = function() {
        var bbox = game_grid.bounding_box();

        game_canvas.height = bbox.height;
        game_canvas.width = bbox.width;
    }

    this.render_one_frame = function() {

        this.resize_canvas();

        this.render_engine.render_one_frame();
    }
}

var game_singlethon = null;
var button_repeat_cells = document.getElementById("button_repeat_cells");

function run() {    

    button_repeat_cells.style.display = "none";

    var canvas = document.getElementById("gamecanvas");
    var context = canvas.getContext('2d');

    game_singlethon = new Game(canvas);

    /*var f = new FontFace("HandMade", "url('fonts/OpenSans-CondLight.ttf')");

    f.load().then(function() {
		document.fonts.add(f);
		game_singlethon.render_one_frame();
    });*/
}

run();
