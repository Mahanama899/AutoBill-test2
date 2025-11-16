var InitialCount = -1;

const deleteProducts = async() => {
    url = 'https://lionfish-app-oy7gr.ondigitalocean.app/product';

    let res = await axios.get(url);
    responseText = res.data;
    const products = responseText;

    for (let product of products) {
        const response = await axios.delete(`https://lionfish-app-oy7gr.ondigitalocean.app/product/${product.id}`)
    }
    location.reload();
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

const loadProducts = async() => {
    url = 'https://lionfish-app-oy7gr.ondigitalocean.app/product';

    let res = await axios.get(url);
    responseText = await res.data;
    const products = responseText;
    var len = products.length;

    if (len > InitialCount + 1) {
        $("#1").css("display", "none");
        $("#home").css("display", "grid");
        $("#2").css("display", "grid");
        var payable = 0;
        const products = responseText;
        console.log(products);
        for (let product of products) {
            payable = payable + parseFloat(product.payable);
        }

        var product = products.pop();
        const x = `
        <section>
                <div class="card card-long animated fadeInUp once">
                    <img src="asset/img/${product.id}.jpg" class="album">
                    <div class="span1">Product Name</div>
                    <div class="card__product">
                        <span>${product.name}</span>
                    </div>
                    <div class="span2">Per Unit</div>
                    <div class="card__price">
                        <span>${product.price} </span>
                    </div>
                    <div class="span3">Units</div>
                    <div class="card__unit">
                        <span>${product.taken} ${product.unit}</span>
                    </div>

                    <div class="span4">Payable</div>
                    <div class="card__amount">
                        <span>${product.payable}</span>
                    </div>
                </div>
            </section>
        <section>
        `

        document.getElementById('home').innerHTML = document.getElementById('home').innerHTML + x;
        // Changed $ to LKR on checkout button
        document.getElementById('2').innerHTML = "CHECKOUT LKR " + payable.toFixed(2);
        InitialCount += 1;
    }
}

var checkout = async() => {
    document.getElementById('2').innerHTML = "<span class='loader-16' style='margin-left: 44%;'></span>"
    var payable = 0;
    url = 'https://lionfish-app-oy7gr.ondigitalocean.app/product';

    let res = await axios.get(url);
    responseText = await res.data;
    products = responseText;

    for (let product of products) {
        payable = payable + parseFloat(product.payable);
    }

    // Plain text with LKR for testing
    const plainData = `Total Payable: LKR ${payable.toFixed(2)}`;
    const encodedPlainData = encodeURIComponent(plainData);
    var url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedPlainData}&size=400x400&color=02c8db&bgcolor=ecf0f3&format=png`;

    await fetch(url)
        .then(function(data) {
            return data.blob();
        })
        .then(function(img) {
            var image = URL.createObjectURL(img);
            $("#home").css("display", "none");
            $("#final").css("display", "none");
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
            $('#image').attr('src', image);
            $("#qr").css("display", "grid");
        });
    setTimeout(function(){
        $("#qr").css("display", "none");
        $("#success").css("display", "grid");
    },10000);

    deleteProducts();
}