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

    // Hide fullscreen button after use
    setTimeout(function () {
        var btn = document.getElementById("fsBtn");
        if (btn) btn.style.display = "none";
    }, 500);
}

/* =========================
   CLEAR PRODUCTS
   ========================= */
const clearProducts = async function () {
    try {
        await axios.post(API_BASE + "/clear", {}, {
            headers: { "Content-Type": "application/json" }
        });
        console.log("Products cleared on server");
    } catch (err) {
        console.error("Clear failed:", err);
    }
};

/* =========================
   RESET UI (NO RELOAD)
   ========================= */
function resetUIAfterCheckout() {
    InitialCount = -1;

    // Clear product cards
    document.getElementById("home").innerHTML = "";

    // Hide all states
    $("#qr").hide();
    $("#success").hide();
    $("#home").hide();

    // Show start screen & checkout button
    $("#1").show();
    $("#final").show();

    // Reset checkout text
    document.getElementById("2").innerHTML = "CHECKOUT";

    console.log("UI reset complete");
}

/* =========================
   LOAD PRODUCTS
   ========================= */
const loadProducts = async function () {
    try {
        let res = await axios.get(API_BASE + "/product");
        const products = res.data;

        if (products.length > InitialCount + 1) {
            $("#1").hide();
            $("#home").show();
            $("#final").show();

            var payable = 0;
            for (var i = 0; i < products.length; i++) {
                payable += parseFloat(products[i].payable);
            }

            var p = products[products.length - 1];

            var card =
                '<section>' +
                '<div class="card card-long animated fadeInUp once">' +
                '<img src="asset/img/' + p.id + '.jpg" class="album">' +
                '<div class="span1">Product Name</div>' +
                '<div class="card__product">' + p.name + '</div>' +
                '<div class="span2">Per Unit</div>' +
                '<div class="card__price">' + p.price + '</div>' +
                '<div class="span3">Units</div>' +
                '<div class="card__unit">' + p.taken + ' ' + p.unit + '</div>' +
                '<div class="span4">Payable</div>' +
                '<div class="card__amount">' + p.payable + '</div>' +
                '</div>' +
                '</section>';

            document.getElementById("home").innerHTML += card;

            document.getElementById("2").innerHTML =
                "CHECKOUT LKR " + payable.toFixed(2);

            InitialCount++;
        }
    } catch (err) {
        console.error("Load products failed:", err);
    }
};

/* =========================
   CHECKOUT (NO RELOAD)
   ========================= */
var checkout = async function () {
    document.getElementById("2").innerHTML = "PROCESSING...";

    let res = await axios.get(API_BASE + "/product");
    const products = res.data;

    var total = 0;
    for (var i = 0; i < products.length; i++) {
        total += parseFloat(products[i].payable);
    }

    var qrText = "Total Payable: LKR " + total.toFixed(2);
    var qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/?data=" +
        encodeURIComponent(qrText) +
        "&size=400x400";

    const img = await fetch(qrUrl).then(function (r) { return r.blob(); });
    document.getElementById("image").src = URL.createObjectURL(img);

    $("#home").hide();
    $("#final").hide();
    $("#qr").show();

    // Show QR
    setTimeout(async function () {
        $("#qr").hide();
        $("#success").show();

        // Clear server cart
        await clearProducts();

        // Reset UI for next customer
        setTimeout(function () {
            resetUIAfterCheckout();
        }, 2000);

    }, 8000);
};

/* =========================
   AUTO LOAD LOOP
   ========================= */
window.onload = function () {
    setInterval(loadProducts, 300);
};
