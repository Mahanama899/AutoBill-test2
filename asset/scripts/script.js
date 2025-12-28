var InitialCount = -1;

const API_BASE = "https://lionfish-app-oy7gr.ondigitalocean.app";

/* =========================
   CLEAR PRODUCTS (LEGACY SAFE)
   ========================= */
const clearProducts = async function () {
    try {
        await axios.post(API_BASE + "/clear", {}, { withCredentials: false });
        console.log("Products cleared on server");
    } catch (err) {
        console.error("Failed to clear products:", err);
    }
};

/* =========================
   LOAD PRODUCTS
   ========================= */
const loadProducts = async function () {
    try {
        let res = await axios.get(API_BASE + "/product", { withCredentials: false });
        const products = res.data;
        const len = products.length;

        if (len > InitialCount + 1) {
            $("#1").css("display", "none");
            $("#home").css("display", "grid");
            $("#2").css("display", "grid");

            var payable = 0;
            for (var i = 0; i < products.length; i++) {
                payable += parseFloat(products[i].payable);
            }

            var product = products[products.length - 1];

            var x =
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

            document.getElementById("home").innerHTML += x;
            document.getElementById("2").innerHTML =
                "CHECKOUT LKR " + payable.toFixed(2);

            InitialCount += 1;
        }
    } catch (err) {
        console.error("Load products failed:", err);
    }
};

/* =========================
   CHECKOUT FUNCTION
   ========================= */
var checkout = async function () {
    try {
        document.getElementById("2").innerHTML =
            "<span class='loader-16' style='margin-left:44%;'></span>";

        let res = await axios.get(API_BASE + "/product", { withCredentials: false });
        const products = res.data;

        var payable = 0;
        for (var i = 0; i < products.length; i++) {
            payable += parseFloat(products[i].payable);
        }

        var plainData = "Total Payable: LKR " + payable.toFixed(2);
        var qrUrl =
            "https://api.qrserver.com/v1/create-qr-code/?data=" +
            encodeURIComponent(plainData) +
            "&size=400x400&color=02c8db&bgcolor=ecf0f3";

        const img = await fetch(qrUrl).then(function (r) { return r.blob(); });
        const image = URL.createObjectURL(img);

        $("#home").css("display", "none");
        $("#final").css("display", "none");
        $("#image").attr("src", image);
        $("#qr").css("display", "grid");

        setTimeout(async function () {
            $("#qr").css("display", "none");
            $("#success").css("display", "grid");

            // 🔥 LEGACY SAFE CLEAR
            await clearProducts();

            // 🔥 FORCE CLEAN RELOAD (CACHE BYPASS)
            setTimeout(function () {
                var baseUrl = window.location.href.split("?")[0];
                window.location.href = baseUrl + "?refresh=" + new Date().getTime();
            }, 1000);

        }, 1000);

    } catch (err) {
        console.error("Checkout failed:", err);
    }
};

/* =========================
   AUTO LOAD LOOP
   ========================= */
window.onload = function () {
    setInterval(loadProducts, 300);
};
