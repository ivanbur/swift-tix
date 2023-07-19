const express = require('express');
const bent = require('bent');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const cheerio = require('cheerio');
const request = require('request');
const requestPromise = require('request-promise');

const ticketmaster_key = '';
const ticketmaster_secret = '';

const seatgeek_key = '';
const seatgeek_secret = '';

const LOWESTPRICE = 400;

let TICKETMASTERDROP16 = false;
let TICKETMASTERDROP17 = false;
let SEATGEEK16 = false;
let SEATGEEK17 = false;
let STUBHUB16 = false;
let STUBHUB17 = false;
 
let app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '@gmail.com',
        pass: ''
    }
});
   

async function ticketmasterdrop() {
    let uri = 'https://app.ticketmaster.com/discovery/v2'; 

    let get = bent(uri, 'GET');

    let response;

    try {
        response = await get('/events/G5vbZ9pIyXIDG?apikey=' + ticketmaster_key); // pitt june 16
        response2 = await get('/events/G5vbZ94wUlfAH?apikey=' + ticketmaster_key); // pitt june 17
    } catch (e) {
        // console.log('error: ' + e);
        return;
    }

    responsejson = await response.json();
    response2json = await response2.json();
    if (responsejson.dates && (responsejson.dates.status.code == 'onsale' || responsejson.dates.status.code != 'offsale') && !TICKETMASTERDROP16) {
        let mailOptions = {
            from: '@gmail.com',
            to: '',
            subject: '!!! Ticketmaster Drop !!!',
            text: 'June 16'
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        TICKETMASTERDROP16 = true;
    }
    if (response2json.dates && (response2json.dates.status.code == 'onsale' || response2json.dates.status.code != 'offsale') && !TICKETMASTERDROP17) {
        let mailOptions = {
            from: '@gmail.com',
            to: '',
            subject: '!!! Ticketmaster Drop !!!',
            text: 'June 17'
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        TICKETMASTERDROP17 = true;
    }
}

async function seatgeekprice() {
    let uri = 'https://api.seatgeek.com/2';

    let get = bent(uri, 'GET');

    let response;

    try {
        response = await get('/events/5868226?client_id=' + seatgeek_key); // pitt june 16
        response2 = await get('/events/5858561?client_id=' + seatgeek_key); // pitt june 17
    } catch (e) {
        // console.log('error: ' + e);
        return;
    }

    responsejson = await response.json();
    response2json = await response2.json();

    if (responsejson.stats) {
        lowest16 = Math.min(responsejson.stats.lowest_price, responsejson.stats.lowest_sg_base_price, responsejson.stats.lowest_price_good_deals, responsejson.stats.lowest_sg_base_price_good_deals);

        if (lowest16 <= LOWESTPRICE && !SEATGEEK16) {
            let mailOptions = {
                from: '@gmail.com',
                to: '',
                subject: '!! SeatGeek Low Price !!',
                text: 'June 16'
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            SEATGEEK16 = true;
        }
    }

    if (response2json.stats) {
        lowest17 = Math.min(response2json.stats.lowest_price, response2json.stats.lowest_sg_base_price, response2json.stats.lowest_price_good_deals, response2json.stats.lowest_sg_base_price_good_deals);

        if (lowest17 <= LOWESTPRICE && !SEATGEEK17) {
            let mailOptions = {
                from: '@gmail.com',
                to: '',
                subject: '!! SeatGeek Low Price !!',
                text: 'June 17'
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            SEATGEEK17 = true;
        }
    }
}

async function stubhubprice() {
    const options16 = {
        method: 'GET',
        url: 'https://api.webscraping.ai/html',
        qs: {
          api_key: "778641a8-ceb9-4d6c-9e47-00f07741074a",
          url: 'https://www.stubhub.com/taylor-swift-pittsburgh-tickets-6-16-2023/event/151214706/?quantity=1',
          proxy: 'datacenter',
          //proxy: 'residential', // try in case if the target site is not accessible on datacenter proxies
          js: true,
          // js: false // try in case if JS doesn't work correctly on the target site
        }
      };

    temp16 = await requestPromise(options16);
    let $16 = cheerio.load(temp16);
    prices16 = $16('.eZxUaP .fMcxDq').text().split('$').map(x => parseInt(x.replace(',', ''))).slice(1, 21); // only has 20 prices
    cheapestprice16 = Math.min.apply(null, prices16);
    if (cheapestprice16 < LOWESTPRICE && !STUBHUB16) {
        let mailOptions = {
            from: '@gmail.com',
            to: '',
            subject: '!! StubHub Low Price !!',
            text: 'June 16'
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        STUBHUB16 = true;
    }


    const options17 = {
        method: 'GET',
        url: 'https://api.webscraping.ai/html',
        qs: {
          api_key: "778641a8-ceb9-4d6c-9e47-00f07741074a",
          url: 'https://www.stubhub.com/taylor-swift-pittsburgh-tickets-6-17-2023/event/150593721/?quantity=1',
          proxy: 'datacenter',
          //proxy: 'residential', // try in case if the target site is not accessible on datacenter proxies
          js: true,
          // js: false // try in case if JS doesn't work correctly on the target site
        }
      };

    temp17 = await requestPromise(options17);
    let $17 = cheerio.load(temp17);
    prices17 = $17('.eZxUaP .fMcxDq').text().split('$').map(x => parseInt(x.replace(',', ''))).slice(1, 21); // only has 20 prices
    cheapestprice17 = Math.min.apply(null, prices17);
    if (cheapestprice17 < LOWESTPRICE && !STUBHUB17) {
        let mailOptions = {
            from: '@gmail.com',
            to: '',
            subject: '!! StubHub Low Price !!',
            text: 'June 17'
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        STUBHUB17 = true;
    }
}


// ticketmasterdrop();
// seatgeekprice();
// stubhubprice();

ticketmasterinterval = setInterval(_ => { ticketmasterdrop() }, 10000);
ticketmasterinterval = setInterval(_ => { seatgeekprice() }, 60000);
ticketmasterinterval = setInterval(_ => { stubhubprice() }, 7200000);