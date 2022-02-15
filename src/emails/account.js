const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const sendwelcomeEmail = (email, name) => {
  sgMail.send({
    from: '20btrcs003@jainuniversity.ac.in',
    to: email,
    subject: 'Thanks for joining in',
    text: `Welcome to the app ${name}. Let me know how you get along`,
  });
};
const sendCancellationEmail = (email, name) => {
  sgMail.send({
    from: '20btrcs003@jainuniversity.ac.in',
    to: email,
    subject: 'Sorry to see you are going',
    text: `hello ${name} we are sorry that you are going`,
  });
};
module.exports = { sendwelcomeEmail, sendCancellationEmail };
