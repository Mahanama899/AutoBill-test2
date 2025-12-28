var InitialCount = -1;
const API_BASE = "https://lionfish-app-oy7gr.ondigitalocean.app";

/* =========================
   FULLSCREEN FUNCTION
   ========================= */
function goFullScreen() {
    var el = document.documentElement;

    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    }

    // Hide button after fullscreen
    setTimeout(function () {
        var btn = document.getElementById("fsBtn");
        if (btn) btn.style.display = "none";
    }, 500);
}

/* =========================
   CLEAR PRODUCTS (POST /clear)
   ========================= */
const clearProducts = async function () {
    try {
        await axios.post(API_BASE + "/clear", {}, {
            headers: { "Content-Type": "application/json" }
        });
        console.log("Products cleared");
    } catch (err) {
        console.error("Clear failed", err);
    }
};

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

            var product = products[products.length - 1];

            var card =
                '<section>' +
                '<div class="card card-long animated fadeInUp once">' +
                '<img src="asset/img/' + product.id + '.jpg" class="album">' +
                '<div class="span1">Product Name</div>' +
                '<div class="card__product">' + product.name + '</div>' +
                '<div class="span2">Per Unit</div>' +
                '<div class="card__price">' + product.price + '</div>' +
                '<div class="span3">Units</div>' +
                '<div class="card__unit">' + product.taken + ' ' + product.unit + '</div>' +
                '<div class="span4">Payable</div>' +
                '<div class="card__amount">' + product.payable + '</div>' +
                '</div>' +
                '</section>';

            document.getElementById("home").innerHTML += card;
            document.getElementById("2").innerHTML =
                "CHECKOUT LKR " + payable.toFixed(2);

            InitialCount++;
        }
    } catch (err) {
        console.error("Load products error", err);
    }
};

/* =========================
   CHECKOUT FUNCTION
   ========================= */
var checkout = async function () {
    document.getElementById("2").innerHTML =
        "<span class='loader-16' style='margin-left:44%;'></span>";

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

    const img = await fetch(qrUrl).then(r => r.blob());
    document.getElementById("image").src = URL.createObjectURL(img);

    $("#home").hide();
    $("#final").hide();
    $("#qr").show();

    setTimeout(async function () {
        $("#qr").hide();
        $("#success").show();

        await clearProducts();

        setTimeout(function () {
            var base = window.location.href.split("?")[0];
            window.location.href = base + "?refresh=" + new Date().getTime();
        }, 1000);

    }, 8000);
};

/* =========================
   AUTO LOAD LOOP
   ========================= */
window.onload = function () {
    setInterval(loadProducts, 300);
};
