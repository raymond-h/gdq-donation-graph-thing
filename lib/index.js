require('dotenv').config();
const got = require('got');
const cheerio = require('cheerio');
const parseDecimalNumber = require('parse-decimal-number');

const regex = /^Donation Total: \$([\d,.]+) \((\d+)\) — Max\/Avg Donation: \$([\d,.]+)\/\$([\d,.]+)$/;

async function main() {
    const res = await got.get(process.env.GDQ_TRACKER_URL);

    const $ = cheerio.load(res.body.toString('utf8'));

    const str = $('small').text().trim().replace(/[\r\n]+/g, ' ');

    const [, totalDonations, donationCount, maxDonation, avgDonation] = Array.from(regex.exec(str)).map(parseDecimalNumber);

    console.log({
        totalDonations, donationCount, maxDonation, avgDonation
    });

    await got.post(process.env.GRAPH_THING_POST_URL, {
        body: {
            value: totalDonations
        },
        json: true
    });
}

main().catch(err => console.error(err.stack));
