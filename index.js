'use strict';

const moment = require('moment-timezone');
const axios = require('axios');
const Mailgun = require('mailgun-js');
const ejs = require("ejs");
const fs = require('fs');
const config = require('./config.json');

const emailTemplateString = fs.readFileSync(__dirname + '/email.ejs', 'utf-8');

function sendMail(url, time, recipients) {
    const html = ejs.render(emailTemplateString, { url, time });

    const mailgun = new Mailgun({ apiKey: config.mailgun.apiKey, domain: config.mailgun.domain });
    const data = {
        from: config.fromWhom,
        to: recipients,
        subject: 'Service Down Alert!!!',
        html: html
    }
    mailgun.messages().send(data, function (err, body) {
        if (err) {
            console.log(`Faield to send notification email to ${recipients}: `, err);
        }
    });
}

function monitor(target) {
    const currentTime = moment().tz(target.timezone).format();

    axios.get(target.url)
        .then(function (response) {
            if (!target.flagInError) {
                const found = response.data.indexOf(target.flag);
                if (!found) {
                    sendMail(url, currentTime, target.recipients);
                }
            }
        })
        .catch(function (error) {
            if (target.flagInError) {
                const found = error.response.data ? error.response.data.indexOf(target.flag) : false;
                if (!found) {
                    sendMail(url, currentTime, target.recipients);
                }
            } else {
                sendMail(target.url, currentTime, target.recipients);
                console.error(error.response.data);
            }
        })
        .finally(function () {
            // for testing
            // sendMail(target.url, currentTime, target.recipients);
        });
}

config.targets.forEach(target => {
    monitor(target);
})