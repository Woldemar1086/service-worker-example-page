(function() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js', {scope: '/'}).then(function(reg) {
                if(reg.installing){
                    console.log('Installing ServiceWorker');
                }
                if(reg.waiting){
                    console.log('ServiceWorker is installed');
                }
                if(reg.active){
                    console.log('ServiceWorker is active');
                }
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
})();