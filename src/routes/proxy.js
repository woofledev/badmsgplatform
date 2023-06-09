const httpa = require('http'),
      https = require('https'),
      url = require('url');

app.get('/api/proxyhs', (req, res) =>{
    try {
        var target = req.query.u;
        var opt = url.parse(target);
        var client = opt.protocol === "https:" ? https : httpa;

        var request = client.request(opt, (pres) => {
            var ctype = pres.headers['content-type'];
            if (ctype && (ctype.includes('image') || ctype.includes('video') || ctype.includes('svg')) || target.startsWith("https://twemoji.maxcdn.com")) {
                res.writeHead(pres.statusCode, pres.headers);
                pres.pipe(res);
            } else {
                res.status(500).send('Websites aren\'t allowed.'); // websites can have external javascript linked and stuff
            }
        })
        request.on('error', (e) =>{
            console.error(e);
            res.status(500).send('The proxy couldn\'t process this.');
        })
        request.end();
    } catch (e) {
        console.error(e);
        res.status(500).send('An error occurred.');
    }
});