var InitialCount = -1;
var checkoutInProgress = false;

const API_BASE = "https://lionfish-app-oy7gr.ondigitalocean.app";

/* =========================
   FULL SCREEN FUNCTION
   ========================= */
function goFullScreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) {
        el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
    }
}

/* =========================
   LOAD PRODUCTS
   ========================= */
async function loadProducts() {
    try {
        const res = await axios.get(`${API_BASE}/product`, { timeout: 3000 });
        const products = res.data || [];
        const len = products.length;

        if (len > InitialCount + 1) {
            document.getElementById("1").style.display = "none";
            document.getElementById("home").style.display = "grid";
            document.getElementById("final").style.display = "block";

            let payable = 0;
            products.forEach(p => {
                payable += parseFloat(p.payable || 0);
            });

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

            document.getElementById("home").innerHTML += card;
            document.getElementById("2").innerHTML =
                "CHECKOUT LKR " + payable.toFixed(2);

            InitialCount++;
        }
    } catch (err) {
        console.warn("Load products failed (safe to ignore)");
    }
}

/* =========================
   CHECKOUT (FIXED VERSION)
   ========================= */
async function checkout() {
    if (checkoutInProgress) return;
    checkoutInProgress = true;

    const btn = document.getElementById("2");
    btn.disabled = true;
    btn.innerHTML = "<span class='loader-16'></span>";

    let products = [];
    let payable = 0;

    /* STEP 1 — TRY FETCH PRODUCTS (NON-BLOCKING) */
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 4000);

        const res = await axios.get(`${API_BASE}/product`, {
            signal: controller.signal
        });

        products = res.data || [];
        products.forEach(p => {
            payable += parseFloat(p.payable || 0);
        });
    } catch (err) {
        console.warn("GET failed, proceeding anyway");
    }

    /* STEP 2 — SHOW QR IMMEDIATELY */
    const qrText = `Total Payable: LKR ${payable.toFixed(2)}`;
    const qrUrl =
        `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrText)}&size=400x400`;

    document.getElementById("home").style.display = "none";
    document.getElementById("final").style.display = "none";
    document.getElementById("qr").style.display = "grid";
    document.getElementById("image").src = qrUrl;

    /* STEP 3 — FORCE SUCCESS SCREEN */
    setTimeout(() => {
        document.getElementById("qr").style.display = "none";
        document.getElementById("success").style.display = "grid";
    }, 10000);

    /* STEP 4 — BACKGROUND SERVER CLEANUP */
    setTimeout(async () => {
        try {
            await axios.delete(`${API_BASE}/product`, { timeout: 3000 });
            console.log("Server cleared");
        } catch (err) {
            console.warn("DELETE failed (ignored)");
        }

        /* STEP 5 — RESET UI */
        setTimeout(() => {
            const base = window.location.href.split("?")[0];
            window.location.href = base + "?reset=" + Date.now();
        }, 2000);

    }, 11000);
}

/* =========================
   AUTO LOAD LOOP
   ========================= */
window.onload = function () {
    setInterval(loadProducts, 300);
};
