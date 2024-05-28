const nodemailer = require("nodemailer");

const sendmail = async (res, user, url) => {
    // const sendmail = async (res, email,User) => {
    try {
        // const url = `http://localhost:3000/forget-password/${User._id}`;

        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,  
            auth: {
                user: "kanchanvishwakarma555555@gmail.com",
                pass: "frabozplnpsdfdve",
            },
        });

        
        // const mailOptions = {
        //     from: "Social Media Private Ltd. <social@media.pvt.ltd>",
        //     to: email,  
        //     subject: "Password Reset Link",
        //     text: "Do not share this link to anyone",
        //     html: `<a href="${url}">Reset Password Link</a>`,
        // };

        const mailOptions = {
            from: "Social Media Private Ltd. <social@media.pvt.ltd>",
            to: user.email,  
            subject: "Password Reset Link",
            text: "Do not share this link to anyone",
           html: `<a href="${url}">Reset Password Link</a>`,
        };

        transport.sendMail(mailOptions, async (err, info) => {
            console.log(err)
            // if (err) return res.send(err);
            if (err) return res.send(err);
            console.log(info);

            user.resetPasswordToken = 1;
            await user.save();

            res.send(
                `<h1 class="text-5xl text-center mt-5 bg-red-300">Check your inbox/spam.</h1>`
                `<h1 style="text-align:center; margin-top:20px; color:tomato">Check your inbox/spam.</h1>`
            );
        });
    } catch (error) {
        res.send(error);
    }
};

module.exports = sendmail;