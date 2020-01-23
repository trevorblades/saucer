const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async event => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  const {from, subject, text} = JSON.parse(event.body);
  await sgMail.send({
    to: 'support@saucer.dev',
    from,
    subject: `[Contact form] ${subject}`,
    text
  });

  return {
    statusCode: 200,
    body: 'OK'
  };
};
