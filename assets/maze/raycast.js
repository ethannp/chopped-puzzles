// Initialization --------
const boxSize = 8;
const pixelDensity = 1;
const gridSize = 60 * pixelDensity;
const PI = Math.PI;
const dofMax = 15;
let won = false;

document.getElementById("newsize").remove();

Object.defineProperty(UserSettings, "displaysize", {
    set(newValue) {
        this._displaysize = newValue;
        redraw_grid();
    }
})
create_newboard = function () {
    UserSettings.displaysize = boxSize;
    var mode = pu.mode;
    pu = new Puzzle_square(parseInt(gridSize, 10), parseInt(gridSize, 10), UserSettings.displaysize);
    pu.mode = mode;
    pu.rules = `
    Classic Maze rules apply.<br/><br/>
Desktop: Use WASD<br/>
Mobile: Click and drag on the grid (you need to continuously drag and move your finger to move)
    `
    pu.reset_frame();
    panel_pu.draw_panel();
    pu.mode_set(pu.mode[pu.mode.qa].edit_mode);
}

setAllBlue = function () {
    let index = 65;
    for (let i = 0; i < 62; i++) {
        for (let j = 0; j < 62; j++) {
            pu.pu_q.surface[index] = 5;
            index++;
        }
        index += 2;
    }
}

degToRad = function (deg) {
    return deg * (PI / 180);
}

// Map --------

const mapX = 10;
const mapY = 10;
const mapS = 100;
const mapW = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    9, 0, 0, 0, 0, 0, 0, 1, 0, 1,
    1, 1, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 1, 1, 1, 1, 1, 1,
    1, 0, 1, 1, 1, 0, 0, 0, 1, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 1, 0, 1, 0, 1, 1, 1, 0, 1,
    1, 0, 0, 1, 0, 0, 0, 1, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 2, 1
];

// Player Movement --------
let pressedKeys = {};
let px = 90.12304903920,
    py = 90.102394091324,
    pa = 0.09584381;
console.log()
let pdx = Math.cos(degToRad(pa)) * 5,
    pdy = -Math.sin(degToRad(pa)) * 5;
indexToRowCol = function (index) {
    index = index - 130;
    return {
        row: Math.floor(index / 64),
        col: index % 64
    };
}

rowColToIndex = function (row, col) { // 0 indexed
    return 130 + (row * 64) + col;
}

getQuadrantFromIndex = function (index) {
    if (index == undefined) {
        return -1;
    }
    let x = indexToRowCol(index);
    if (x.col < 0 || x.col > 59 || x.row < 0 || x.row > 59) {
        return -1;
    }
    if (x.row < x.col) {
        //top half 
        if (x.row + x.col < 59) {
            return "TOP";
        }
        return "RIGHT";
    }
    // bottom half
    if (x.row + x.col < 59) {
        return "LEFT";
    }
    return "BOTTOM";
}

checkPlayerMovement = function () {

    let clicked = Object.keys(pu.pu_a.surface)[0];
    let dir = getQuadrantFromIndex(clicked);

    let xo = 0;
    if (pdx < 0) {
        xo = -20;
    } else {
        xo = 20;
    }
    let yo = 0;
    if (pdy < 0) {
        yo = -20;
    } else {
        yo = 20;
    }
    let ipx = parseInt(px / 64.0),
        ipx_add_xo = parseInt((px + xo) / 64.0),
        ipx_sub_xo = parseInt((px - xo) / 64.0);
    let ipy = parseInt(py / 64.0),
        ipy_add_yo = parseInt((py + yo) / 64.0),
        ipy_sub_yo = parseInt((py - yo) / 64.0);
    if (ipx == 8 && ipy == 8 && won == false) {
        let message = document.getElementById("custom_message").value;
        if (message == "" || message.includes("http-equiv=")) {
            message = Identity.solveDefaultMessage;
        }
        setTimeout(() => {
            Swal.fire({
                title: Identity.solveTitle ? "<h3 class=wish style=color:white>" + Identity.solveTitle + "</h3>" : undefined,
                html: "<h2 class=`wish` style=color:white>" + message + "</h2>",
                background: "url(js/images/new_year.jpg)",
                icon: "success",
                confirmButtonText: Identity.solveOKButtonText,
                // timer: 5000
            })
        }, 20);
        sw_timer.pause();
        won = true;
    }
    if (dir == "TOP" || pressedKeys[87]) {
        if (mapW[ipy * mapX + ipx_add_xo] == 0) {
            px += pdx * 5;
        }
        if (mapW[ipy_add_yo * mapX + ipx] == 0) {
            py += pdy * 5;
        }
    }
    if (dir == "BOTTOM" || pressedKeys[83]) {
        if (mapW[ipy * mapX + ipx_sub_xo] == 0) {
            px -= pdx * 5;
        }
        if (mapW[ipy_sub_yo * mapX + ipx] == 0) {
            py -= pdy * 5;
        }
    }
    if (dir == "RIGHT" || pressedKeys[68]) {
        pa -= 5;
        pa = fixAngle(pa);
        pdx = Math.cos(degToRad(pa));
        pdy = -Math.sin(degToRad(pa));
    }
    if (dir == "LEFT" || pressedKeys[65]) {
        pa += 5;
        pa = fixAngle(pa);
        pdx = Math.cos(degToRad(pa));
        pdy = -Math.sin(degToRad(pa));
    }
    pu.pu_a.surface = {};
}

fixAngle = function (angle) {
    if (angle > 359) {
        angle -= 360;
    }
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}

raycast = function () {
    let r = 0,
        mx = 0,
        my = 0,
        mp = 0,
        dof = 0;
    let rx = 0,
        ry = 0,
        ra = 0,
        xo = 0,
        yo = 0,
        disV = 0,
        disH = 0;
    ra = fixAngle(pa + 30);
    for (r = 0; r < 60; r++) {
        // Vertical
        let vColor = -1;

        dof = 0;
        disV = 100000;
        let tan = Math.tan(degToRad(ra));
        if (Math.cos(degToRad(ra)) > 0.001) {
            rx = ((parseInt(px) >> 6) << 6) + 64;
            ry = (px - rx) * tan + py;
            xo = 64;
            yo = -xo * tan;
        } else if (Math.cos(degToRad(ra)) < -0.001) {
            rx = ((parseInt(px) >> 6) << 6) - 0.0001;
            ry = (px - rx) * tan + py;
            xo = -64;
            yo = -xo * tan;
        } else {
            rx = px;
            ry = py;
            dof = dofMax;
        }

        while (dof < dofMax) {
            mx = parseInt(rx) >> 6;
            my = parseInt(ry) >> 6;
            mp = my * mapX + mx;
            if (mp > 0 && mp < mapX * mapY && mapW[mp] != 0) {
                dof = dofMax;
                vColor = mapW[mp];
                disV = Math.cos(degToRad(ra)) * (rx - px) - Math.sin(degToRad(ra)) * (ry - py);
            } else {
                rx += xo;
                ry += yo;
                dof += 1;
            }
        }
        vx = rx;
        vy = ry;

        // Horizontal
        dof = 0;
        let hColor = -1;
        disH = 100000;
        tan = 1.0 / tan;
        if (Math.sin(degToRad(ra)) > 0.001) {
            ry = ((parseInt(py) >> 6) << 6) - 0.0001;
            rx = (py - ry) * tan + px;
            yo = -64;
            xo = -yo * tan;
        } else if (Math.sin(degToRad(ra)) < -0.001) {
            ry = ((parseInt(py) >> 6) << 6) + 64;
            rx = (py - ry) * tan + px;
            yo = 64;
            xo = -yo * tan;
        } else {
            rx = px;
            ry = py;
            dof = dofMax;
        }

        while (dof < dofMax) {
            mx = parseInt(rx) >> 6;
            my = parseInt(ry) >> 6;
            mp = my * mapX + mx;
            if (mp > 0 && mp < mapX * mapY && mapW[mp] != 0) {
                dof = dofMax;
                disH = Math.cos(degToRad(ra)) * (rx - px) - Math.sin(degToRad(ra)) * (ry - py);
                hColor = mapW[mp];
            } else {
                rx += xo;
                ry += yo;
                dof += 1;
            }
        }

        // draw
        let color = 3;
        if (disV < disH) {
            rx = vx;
            ry = vy;
            disH = disV;
            if (vColor == 9 || vColor == 2) {
                color = vColor;
            }
        } else {
            if (hColor == 9 || hColor == 2) {
                color = hColor;
            } else {
                color = 8;
            }
        }
        let ca = parseInt(fixAngle(pa - ra));
        disH = disH * Math.cos(degToRad(ca));
        let lineH = parseInt((mapS * 60) / disH);
        if (lineH > 60) {
            lineH = 60;
        }
        let lineOff = parseInt(30 - (lineH / 2));
        for (let row = 0; row < 60; row++) {
            if (lineOff <= row && row < lineOff + lineH) {
                pu.pu_q.surface[rowColToIndex(row, r)] = color;
            } else if (lineOff + lineH <= row) {
                pu.pu_q.surface[rowColToIndex(row, r)] = 1;
            }
        }

        ra = fixAngle(ra - 1);
    }
}

// Game Start ------

window.onkeyup = function (e) {
    pressedKeys[e.keyCode] = false;
}
window.onkeydown = function (e) {
    pressedKeys[e.keyCode] = true;
}
create_newboard();
setAllBlue();

setInterval(() => {
    setAllBlue();
    checkPlayerMovement();
    raycast();
    pu.redraw();
}, 50)