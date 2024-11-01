function wts_init() {
    window.wts_data = window.wts_data || {};

    if (!window.wts_data.is_admin && window.wts_data.alias && window.wts_data.db) {
        window.wts_data.fetched = 1;
        recordHit();
        return;
    } else if (window.wts_data.is_admin && window.wts_data.alias && window.wts_data.db && window.wts_data.oc_a2) {
        window.wts_data.fetched = 1;
        initAdmin();
        return;
    }
    
    fetchData().then(function() {
        if (window.wts_data.is_admin) {
            initAdmin();
        } else {
            recordHit();
        }
    });
}

function fetchData() {
    return fetch(wts_data.ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                JSON_data: JSON.stringify(window.wts_data)
            })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data && Object.keys(data).length > 0) {
                if (window.wts_data.is_admin) {
                    sendDataToPHP(data);
                }
                window.wts_data.fetched = true;
                Object.assign(window.wts_data, data);
            }
        })
        .catch(function(error) {
            console.error('Error fetching data:', error);
        });
}

function recordHit() {
    var script = document.createElement('script');
    script.src = 'https://app.ardalio.com/log7.js';
    script.onload = function() {
        var wts_div = document.createElement("div");
        wts_div.setAttribute("id", "wts" + wts_data.alias);
        wts_div.style.textAlign = "center";
        document.body.appendChild(wts_div);
        window.wts7 = {};
        window.wts7.user_id = wts_data.user_id;
        window.wts7.user_info = wts_data.user_info;
        window.wts7.params = "wordPress";
        wtslog7(wts_data.alias, wts_data.db);
    };
    document.head.appendChild(script);
}

function initAdmin() {
    return;
}

function sendDataToPHP(data) {
    fetch(wts_data.php_ajax_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                action: 'handle_ajax_data',
                nonce: wts_data.nonce,
                data: JSON.stringify(data)
            })
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
            if (! response.success) {
                console.error('Error sending data to PHP:', response.data);
            }
        })
        .catch(function(error) {
            console.error('Error sending data to PHP:', error);
        });
}

if (document.readyState !== 'loading') {
    wts_init();
} else {
    document.addEventListener('DOMContentLoaded', wts_init);
}

