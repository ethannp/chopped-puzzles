let size = 70;
let flag = false;
let t = [1, "angleloop", 1];
let s = [2, "angleloop", 1]
let p = [3, "angleloop", 1]
let board = [
    [0, 0, s, 0, 0, p, 0],
    [s, t, 0, p, t, 0, t],
    [0, 0, 0, t, 0, 0, 0],
    [0, 0, t, 0, 0, 0, s],
    [0, 0, 0, t, p, 0, 0],
    [0, 0, p, t, 0, 0, 0],
    [0, 0, 0, s, 0, 0, 0],
];

const topedge = {
    "94,95": 21,
    "93,94": 21,
    "92,93": 21,
    "91,92": 21,
    "95,96": 21
};
const leftedge = {
    "91,100": 21,
    "100,109": 21,
    "109,118": 21,
    "118,127": 21,
    "127,136": 21
};
const bottomedge = {
    "136,137": 21,
    "137,138": 21,
    "138,139": 21,
    "139,140": 21,
    "140,141": 21
};
const rightedge = {
    "132,141": 21,
    "123,132": 21,
    "114,123": 21,
    "105,114": 21,
    "96,105": 21
};

let freeLineMaster = [];

function screenDetails() {
    let topleftx = Math.max(0, Math.min(Math.floor(window.screenX / size), 2));
    let toplefty = Math.max(0, Math.min(Math.floor(window.screenY / size), 2));
    // fix freeline
    let freelinefix = [];
    pu.pu_a.freeline = (pu.pu_a.freeline === undefined ? {} : pu.pu_a.freeline);
    for (const [key, value] of Object.entries(pu.pu_a.freeline)) {
        let coords = key.split(",");
        freelinefix.push({
            coord0: [penpaTo5x5(coords[0])[1] + toplefty - 2, penpaTo5x5(coords[0])[0] + topleftx - 2],
            coord1: [penpaTo5x5(coords[1])[1] + toplefty - 2, penpaTo5x5(coords[1])[0] + topleftx - 2]
        });
    }

    const windowDetails = {
        screenX: window.screenX,
        screenY: window.screenY,
        screenWidth: window.screen.availWidth,
        screenHeight: window.screen.availHeight,
        width: window.outerWidth,
        height: window.innerHeight,
        freeline: freelinefix,
        updated: Date.now()
    }
    return windowDetails;
}

document.getElementById("buttons").remove();
document.getElementById("tool-container").remove();

function equalarrs(a, b) {
    return a[0] == b[0] && a[1] == b[1];
}

function merge(arr1, arr2) {
    return arr1
        .filter(obj1 => !arr2.some(obj2 => (equalarrs(obj1["coord0"], obj2["coord0"]) && equalarrs(obj1["coord1"], obj2["coord1"]))))
        .concat(
            arr2.filter(obj2 => !arr1.some(obj1 => equalarrs(obj1["coord0"], obj2["coord0"]) && equalarrs(obj1["coord1"], obj2["coord1"])))
        );
}

function penpaTo5x5(coord) {
    coord = parseInt(coord);
    return [coord % 9, Math.floor(coord / 9)];
}

function convert5x5topenpa(row, col) {
    return ((row + 2) * 9) + col + 2;
}

function checksol() {
    let sol = [{
            "coord0": [
                0,
                2
            ],
            "coord1": [
                1,
                0
            ]
        },
        {
            "coord0": [
                0,
                2
            ],
            "coord1": [
                2,
                3
            ]
        },
        {
            "coord0": [
                1,
                1
            ],
            "coord1": [
                2,
                3
            ]
        },
        {
            "coord0": [
                1,
                1
            ],
            "coord1": [
                4,
                3
            ]
        },
        {
            "coord0": [
                1,
                0
            ],
            "coord1": [
                5,
                2
            ]
        },
        {
            "coord0": [
                1,
                4
            ],
            "coord1": [
                3,
                6
            ]
        },
        {
            "coord0": [
                1,
                4
            ],
            "coord1": [
                1,
                6
            ]
        },
        {
            "coord0": [
                0,
                5
            ],
            "coord1": [
                1,
                6
            ]
        },
        {
            "coord0": [
                0,
                5
            ],
            "coord1": [
                1,
                3
            ]
        },
        {
            "coord0": [
                1,
                3
            ],
            "coord1": [
                4,
                4
            ]
        },
        {
            "coord0": [
                4,
                4
            ],
            "coord1": [
                5,
                3
            ]
        },
        {
            "coord0": [
                3,
                2
            ],
            "coord1": [
                4,
                3
            ]
        },
        {
            "coord0": [
                3,
                2
            ],
            "coord1": [
                5,
                3
            ]
        },
        {
            "coord0": [
                5,
                2
            ],
            "coord1": [
                6,
                3
            ]
        },
        {
            "coord0": [
                3,
                6
            ],
            "coord1": [
                6,
                3
            ]
        }
    ];
    for (const val of sol) {
        if (!boardHas(val)) {
            return false;
        }
    }
    return true;
}

function boardHas(obj1) {
    return freeLineMaster.some(obj2 => {
        return equalarrs(obj1["coord0"], obj2["coord0"]) && equalarrs(obj1["coord1"], obj2["coord1"])
    })
}

function update() {
    const screen = screenDetails();
    let topleftx, toplefty;
    topleftx = Math.max(0, Math.min(Math.floor(screenX / size), 2));
    toplefty = Math.max(0, Math.min(Math.floor(screenY / size), 2));
    pu.pu_q.lineE = {};
    if (toplefty == 0) {
        pu.pu_q.lineE = {
            ...pu.pu_q.lineE,
            ...topedge
        };
    }
    if (toplefty == 2) {
        pu.pu_q.lineE = {
            ...pu.pu_q.lineE,
            ...bottomedge
        };
    }
    if (topleftx == 0) {
        pu.pu_q.lineE = {
            ...pu.pu_q.lineE,
            ...leftedge
        };
    }
    if (topleftx == 2) {
        pu.pu_q.lineE = {
            ...pu.pu_q.lineE,
            ...rightedge
        };
    }

    let runningFreeLine = screen.freeline;
    freeLineMaster = merge(runningFreeLine, freeLineMaster);
    pu.pu_q.freeline = {};
    // draw the displayed freelines pu.pu_q.freeline = freeLineMaster;
    for (const c of freeLineMaster) {
        let objkey = (convert5x5topenpa(c["coord0"][0] - toplefty, c["coord0"][1] - topleftx)) + "," + convert5x5topenpa(c["coord1"][0] - toplefty, c["coord1"][1] - topleftx)
        pu.pu_q.freeline[objkey] = 3;
    }
    //draw the displayed angleloop shapes
    pu.pu_q.symbol = {};
    for (let r = toplefty; r < toplefty + 5; r++) {
        for (let c = topleftx; c < topleftx + 5; c++) {
            if (board[r][c] != 0) {
                pu.pu_q.symbol[convert5x5topenpa(r - toplefty, c - topleftx)] = board[r][c];
            }
        }
    }
    pu.pu_a.freeline = {};
    pu.redraw();
    if (checksol() && !flag) {
        flag = true;
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
            })
        }, 20);
        sw_timer.pause();
    }
}

const timers = []

function go() {
    timers.push(setInterval(update, 100));
}

pu.pu_a.freeline = {};
pu.pu_q.freeline = {};
go();