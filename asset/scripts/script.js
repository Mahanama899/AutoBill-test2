var InitialCount = -1;
var checkoutRunning = false;

const API_BASE = "https://lionfish-app-oy7gr.ondigitalocean.app";

/* =========================
   FULL SCREEN
   ========================= */
function goFullScreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
}

/* =========================
   DELETE PRODUCTS (SERVER)
   ========================= */
const deleteProducts = async () => {
    try {
        await axios.delete(`${API_BASE}/product`, { timeout: 5000 });
        console.log("Server products cleared");
    } catch (err) {
        console.warn("Delete failed (ignored)");
    }
};

/* =========================
   LOAD PRODUCTS
   ========================= */
const loadProducts = async () => {
    try {
        const res = await axios.get(`${API_BASE}/product`, { timeout: 3000 });
        const products = res.data || [];
        const len = products.length;

        // No products → idle screen
        if (len === 0) {
            $("#home").empty().hide();
            $("#1").css("display", "grid");
            $("#2").hide();               // hide checkout button ONLY
            InitialCount = -1;
            return;
        }

        // New product added
        if (len > InitialCount) {
            $("#1").hide();
            $("#home").css("display", "grid");
            $("#2").css("display", "grid");   // show checkout button

            let payable = 0;
            products.forEach(p => payable += parseFloat(p.payable || 0));

            const product = products[products.length - 1];

            const card = `
            <section>
                <div class="card card-long animated fadeInUp once">
                    <img src="asset/img/${product.id}.jpg" class="album">

                    <div class="span1">Product Name</div>
                    <div class="card__product">${product.name}</div>

                    <div class="span2">Per Unit</div>
                    <div class="card__price">${product.price}</div>

                    <div class="span3">Units</div>
                    <div class="card__unit">${product.taken} ${product.unit}</div>

                    <div class="span4">Payable</div>
                    <div class="card__amount">${product.payable}</div>
                </div>
            </section>
            `;

            $("#home").append(card);
            $("#2").html("CHECKOUT LKR " + payable.toFixed(2));

            InitialCount = len;
        }
    } catch (err) {
        console.warn("Load products failed (safe)");
    }
};

/* =========================
   CHECKOUT (MOVE UI FIRST)
   ========================= */
async function checkout() {
    if (checkoutRunning) return;
    checkoutRunning = true;

    // Disable checkout button immediately
    $("#2").html("<span class='loader-16'></span>");
    $("#2").prop("disabled", true);

    /* -------- STEP 1: MOVE UI FIRST -------- */
    $("#home").hide();
    $("#2").hide();                 // hide button ONLY
    $("#qr").css("display", "grid");

    // Temporary QR
    $("#image").attr(
        "src",
        "https://api.qrserver.com/v1/create-qr-code/?data=Processing...&size=400x400"
    );

    /* -------- STEP 2: FETCH TOTAL (BACKGROUND) -------- */
    let payable = 0;
    try {
        const res = await axios.get(`${API_BASE}/product`, { timeout: 5000 });
        const products = res.data || [];
        products.forEach(p => payable += parseFloat(p.payable || 0));
    } catch (e) {
        console.warn("Fetch failed, continuing");
    }

    /* -------- STEP 3: UPDATE QR -------- */
    const qrText = `Total Payable: LKR ${payable.toFixed(2)}`;
    const qrUrl =
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrText)}&size=400x400&color=02c8db&bgcolor=ecf0f3`;
    $("#image").attr("src", qrUrl);

    /* -------- STEP 4: SUCCESS SCREEN -------- */
    setTimeout(() => {
        $("#qr").hide();
        $("#success").css("display", "grid");
    }, 10000);

    /* -------- STEP 5: CLEANUP + RESET -------- */
    setTimeout(async () => {
        await deleteProducts();

        $("#success").hide();
        $("#1").css("display", "grid");  // idle screen
        $("#home").hide().empty();
        $("#2").html("CHECKOUT").prop("disabled", false).hide();

        InitialCount = -1;
        checkoutRunning = false;

    }, 13000);
}

/* =========================
   AUTO LOAD LOOP
   ========================= */
window.onload = () => {
    setInterval(loadProducts, 300);
};
