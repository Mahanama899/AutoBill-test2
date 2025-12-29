var InitialCount = -1;
const API_BASE = "https://lionfish-app-oy7gr.ondigitalocean.app";

/* FULL SCREEN */
function goFullScreen() {
    var el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
}

/* LOAD PRODUCTS */
async function loadProducts() {
    try {
        const res = await axios.get(API_BASE + "/product");
        const products = res.data;

        if (products.length > InitialCount + 1) {
            $("#startScreen").hide();
            $("#home").show();
            $("#final").show();

            let payable = 0;
            products.forEach(p => payable += parseFloat(p.payable));

            const product = products[products.length - 1];

            $("#home").append(`
                <div class="card">
                    <p><b>${product.name}</b></p>
                    <p>Unit: ${product.taken} ${product.unit}</p>
                    <p>Price: LKR ${product.payable}</p>
                </div>
            `);

            $("#checkoutBtn").text("CHECKOUT LKR " + payable.toFixed(2));
            InitialCount++;
        }
    } catch (e) {
        console.log(e);
    }
}

/* DELETE PRODUCTS */
async function deleteProducts() {
    await axios.delete(API_BASE + "/product");
}

/* RESET UI (NO RELOAD) */
function resetUI() {
    InitialCount = -1;
    $("#home").empty().hide();
    $("#final").hide();
    $("#qr").hide();
    $("#success").hide();
    $("#startScreen").show();
}

/* CHECKOUT */
async function checkout() {
    $("#checkoutBtn").text("PROCESSING...");

    const res = await axios.get(API_BASE + "/product");
    let total = 0;
    res.data.forEach(p => total += parseFloat(p.payable));

    const qrText = encodeURIComponent("Total Payable: LKR " + total.toFixed(2));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${qrText}&size=300x300`;

    $("#image").attr("src", qrUrl);
    $("#home").hide();
    $("#final").hide();
    $("#qr").show();

    setTimeout(async () => {
        $("#qr").hide();
        $("#success").show();

        await deleteProducts();

        setTimeout(() => {
            resetUI();
        }, 3000);

    }, 8000);
}

/* AUTO REFRESH */
setInterval(loadProducts, 300);
