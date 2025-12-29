var InitialCount = -1;
const API_BASE = "https://lionfish-app-oy7gr.ondigitalocean.app";

/* =========================
   FULLSCREEN
   ========================= */
function goFullScreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();

    setTimeout(function () {
        var btn = document.getElementById("fsBtn");
        if (btn) btn.style.display = "none";
    }, 300);
}

/* =========================
   CLEAR PRODUCTS
   ========================= */
async function clearProducts() {
    await axios.post(API_BASE + "/clear", {}, {
        headers: { "Content-Type": "application/json" }
    });
}

/* =========================
   RESET UI
   ========================= */
function resetUIAfterCheckout() {
    InitialCount = -1;

    document.getElementById("home").innerHTML = "";

    document.getElementById("qr").style.display = "none";
    document.getElementById("success").style.display = "none";
    document.getElementById("home").style.display = "none";

    document.getElementById("startScreen").style.display = "block";

    // FORCE checkout button visible
    document.getElementById("final").style.display = "block";
    document.getElementById("checkoutBtn").style.display = "block";
    document.getElementById("checkoutBtn").innerHTML = "CHECKOUT";
}

/* =========================
   LOAD PRODUCTS
   ========================= */
async function loadProducts() {
    let res = await axios.get(API_BASE + "/product");
    const products = res.data;

    if (products.length > InitialCount + 1) {
        document.getElementById("startScreen").style.display = "none";
        document.getElementById("home").style.display = "block";

        // FORCE checkout visible
        document.getElementById("final").style.display = "block";
        document.getElementById("checkoutBtn").style.display = "block";

        var payable = 0;
        for (var i = 0; i < products.length; i++) {
            payable += parseFloat(products[i].payable);
        }

        var p = products[products.length - 1];

        document.getElementById("home").innerHTML +=
            '<section><div class="card">' +
            '<img src="asset/img/' + p.id + '.jpg">' +
            '<div>' + p.name + '</div>' +
            '<div>' + p.payable + '</div>' +
            '</div></section>';

        document.getElementById("checkoutBtn").innerHTML =
            "CHECKOUT LKR " + payable.toFixed(2);

        InitialCount++;
    }
}

/* =========================
   CHECKOUT
   ========================= */
async function checkout() {
    document.getElementById("checkoutBtn").innerHTML = "PROCESSING...";

    let res = await axios.get(API_BASE + "/product");
    const products = res.data;

    var total = 0;
    for (var i = 0; i < products.length; i++) {
        total += parseFloat(products[i].payable);
    }

    var qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/?data=" +
        encodeURIComponent("Total Payable: LKR " + total.toFixed(2)) +
        "&size=400x400";

    const img = await fetch(qrUrl).then(r => r.blob());
    document.getElementById("image").src = URL.createObjectURL(img);

    document.getElementById("home").style.display = "none";
    document.getElementById("final").style.display = "none";
    document.getElementById("qr").style.display = "block";

    setTimeout(async function () {
        document.getElementById("qr").style.display = "none";
        document.getElementById("success").style.display = "block";

        await clearProducts();

        setTimeout(resetUIAfterCheckout, 2000);
    }, 8000);
}

/* =========================
   LOOP
   ========================= */
window.onload = function () {
    setInterval(loadProducts, 300);
};
