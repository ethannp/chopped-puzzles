async function run() {
    let firebase = await import("https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js");
    let database = await import("https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js");
    
    /* Firebase Config Details Removed */

    const app = firebase.initializeApp(firebaseConfig);

    let db = database.getDatabase(app);
    pu.pu_a.surface = {};

    try {
        document.getElementById("newsize").remove();
    } catch (e){}

    database.onValue(database.ref(db, "data"), (snap) => {
        if (snap.val() == null) {
            pu.pu_q.surface = {};
            pu.redraw();
        } else {
            pu.pu_q.surface = snap.val();
            pu.redraw();
        }
    })

    setInterval(() => {
        if (Object.keys(pu.pu_a.surface).length != 0) {
            database.update(database.ref(db, "data"), pu.pu_a.surface);
            pu.pu_a.surface = {};
            pu.redraw();
        }
    }, 100)
};

run();