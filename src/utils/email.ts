const client = require('@sendgrid/mail');

export const VERIFY_SENDER: string = "no-reply@forfliescrypto.com";
export const EMAIL_SENDER: string = "hello@forfliescrypto.com";

export interface WelcomeEmail {
  email: string;
  username?: string;
  login_url: string;
}

export interface ResetPasswordEmail {
  action_url: string;
  operating_system?: string;
  browser_name?: string;
  support_url: string;
}

export interface DynamicEmail {
  to: string;
  from: string;
  templateId?: string;
  dynamicData: WelcomeEmail | ResetPasswordEmail;
}

// Define welcome email options and reset password email options
export function DynamicOptions(data: DynamicEmail) {
  const mailOptions = {
    from: {
      email: data.from
    },
    personalizations: [
      {
        to: [
          {
            email: data.to
          }
        ],
        dynamic_template_data: data.dynamicData
      }
    ],
    template_id: data.templateId
  };

  return mailOptions;
}

export async function sendEmail(info: any) {
  const { emailType, sendTo, data } = info;

  let mailOption;
  if (emailType === "welcome") {
    // Get welcome email option
    mailOption = DynamicOptions({
      to: data.to,
      from: EMAIL_SENDER,
      templateId: process.env.SENDGRID_WELCOME_EMAIL,
      dynamicData: {
        email: data.to,
        login_url: data.login_url,
        username: data.username
      }
    });
  } else if (emailType === "reset") {
    // Get reset password email option
    mailOption = DynamicOptions({
      to: data.to,
      from: EMAIL_SENDER,
      templateId: process.env.SENDGRID_FORGOT_PASS_EMAIL,
      dynamicData: {
        action_url: data.action_url,
        support_url: data.support_url,
        operating_system: data.operating_system,
        browser_name: data.browser_name,
      }
    });
  } else if (emailType === "confirm") {
    mailOption = {
      from: {
        email: VERIFY_SENDER
      },
      personalizations: [
        {
          to: [
            {
              email: sendTo
            }
          ],
          dynamic_template_data: {
            ...data,
            subject: `Your Forflies signup code is ${data.twilio_code}`
          }
        }
      ],
      template_id: process.env.SENDGRID_EMAIL_VERIFY
    };
  }

  if (mailOption) {
    try {
      client.setApiKey(process.env.SENDGRID_API_KEY);
      const result = await client.send(mailOption)
      if (result) return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      console.error(error);
    }
  }

  return { success: false, message: 'Email type or something went wrong.' };
}