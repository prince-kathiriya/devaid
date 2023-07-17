const env = require('../../config/env.config');
module.exports = {
  sendOTP: ({ otp, name }) => {
    return `<html>
    <head>
        <title></title>
        <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta http-equiv='X-UA-Compatible' content='IE=edge' />
        <style type='text/css'>
        /* FONTS */
        @media screen {
            @font-face {
            font-family: 'Lato';
            font-style: normal;
            font-weight: 400;
            src: local('Lato Regular'), local('Lato-Regular'),
                url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff)
                format('woff');
            }

            @font-face {
            font-family: 'Lato';
            font-style: normal;
            font-weight: 700;
            src: local('Lato Bold'), local('Lato-Bold'),
                url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff)
                format('woff');
            }

            @font-face {
            font-family: 'Lato';
            font-style: italic;
            font-weight: 400;
            src: local('Lato Italic'), local('Lato-Italic'),
                url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff)
                format('woff');
            }

            @font-face {
            font-family: 'Lato';
            font-style: italic;
            font-weight: 700;
            src: local('Lato Bold Italic'), local('Lato-BoldItalic'),
                url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff)
                format('woff');
            }
        }

        /* CLIENT-SPECIFIC STYLES */
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
        }

        /* RESET STYLES */
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }
        table {
            border-collapse: collapse !important;
        }
        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
        }

        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        /* MOBILE STYLES */
        @media screen and (max-width: 600px) {
            h1 {
            font-size: 32px !important;
            line-height: 32px !important;
            }
        }

        /* ANDROID CENTER FIX */
        div[style*='margin: 16px 0;'] {
            margin: 0 !important;
        }
        </style>
        <style type='text/css'>
        button.btn[data-v-f3fb3dc8] {
            display: inline-block;
            font-weight: 300;
            line-height: 1.25;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            cursor: pointer;
            letter-spacing: 1px;
            transition: all 0.15s ease;
        }
        button.btn.btn-sm[data-v-f3fb3dc8] {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
            border-radius: 0.2rem;
        }
        button.btn.btn-primary[data-v-f3fb3dc8] {
            color: #fff;
            background-color: #45c8f1;
            border-color: #45c8f1;
        }
        button.btn.btn-outline-primary[data-v-f3fb3dc8] {
            color: #45c8f1;
            background-color: transparent;
            border-color: #45c8f1;
        }
        button.btn.btn-danger[data-v-f3fb3dc8] {
            color: #fff;
            background-color: #ff4949;
            border-color: #ff4949;
        }
        .text-muted[data-v-f3fb3dc8] {
            color: #8492a6;
        }
        .text-center[data-v-f3fb3dc8] {
            text-align: center;
        }
        .drop-down-enter[data-v-f3fb3dc8],
        .drop-down-leave-to[data-v-f3fb3dc8] {
            transform: translateX(0) translateY(-20px);
            transition-timing-function: cubic-bezier(0.74, 0.04, 0.26, 1.05);
            opacity: 0;
        }
        .drop-down-enter-active[data-v-f3fb3dc8],
        .drop-down-leave-active[data-v-f3fb3dc8] {
            transition: all 0.15s;
        }
        .move-left-enter[data-v-f3fb3dc8],
        .move-left-leave-to[data-v-f3fb3dc8] {
            transform: translateY(0) translateX(-80px);
            transition-timing-function: cubic-bezier(0.74, 0.04, 0.26, 1.05);
            opacity: 0;
        }
        .move-left-enter-active[data-v-f3fb3dc8],
        .move-left-leave-active[data-v-f3fb3dc8] {
            transition: all 0.15s;
        }
        .no-tr[data-v-f3fb3dc8] {
            transition: none !important;
        }
        .no-tr *[data-v-f3fb3dc8] {
            transition: none !important;
        }
        .overlay[data-v-f3fb3dc8] {
            position: fixed;
            background: rgba(220, 220, 220, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            transition: all 0.2s ease;
            opacity: 0;
            visibility: hidden;
        }
        .overlay .modal[data-v-f3fb3dc8] {
            transition: all 0.2s ease;
            opacity: 0;
            transform: scale(0.6);
            overflow: hidden;
        }
        .overlay.show[data-v-f3fb3dc8] {
            opacity: 1;
            visibility: visible;
        }
        .overlay.show .modal[data-v-f3fb3dc8] {
            opacity: 1;
            transform: scale(1);
        }
        .panel[data-v-f3fb3dc8] {
            padding: 6px 10px;
            display: flex;
            width: 100%;
            box-sizing: border-box;
            align-items: center;
            border-radius: 6px;
            position: relative;
            border: 1px solid #eaf7ff;
            background: #f7fcff;
            outline: none;
            transition: all 0.07s ease-in-out;
        }
        .btn[data-v-f3fb3dc8] {
            cursor: pointer;
            box-sizing: border-box;
        }
        .light-btn[data-v-f3fb3dc8] {
            padding: 10px 12px;
            display: flex;
            width: 100%;
            box-sizing: border-box;
            align-items: center;
            border-radius: 6px;
            position: relative;
            border: 1px solid #eaf7ff;
            background: #f7fcff;
            outline: none;
            cursor: pointer;
            transition: all 0.07s ease-in-out;
        }
        .light-btn[data-v-f3fb3dc8]:hover {
            background: #e0f4ff;
            border-color: #8acfff;
        }
        .primary-btn[data-v-f3fb3dc8] {
            background: #239bf5;
            color: white;
            border-radius: 6px;
            height: 46px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.2s ease;
            font-size: 14px;
            font-family: 'Didact Gothic Regular', sans-serif;
        }
        .primary-btn[data-v-f3fb3dc8]:hover {
            background: #40a8f6;
            color: white;
            text-decoration: none;
        }
        .shake[data-v-f3fb3dc8] {
            animation: shake-f3fb3dc8 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97)
            both;
            transform: translate3d(0, 0, 0);
        }
        @keyframes shake-f3fb3dc8 {
            10%,
            90% {
            transform: translate3d(-1px, 0, 0);
            }
            20%,
            80% {
            transform: translate3d(2px, 0, 0);
            }
            30%,
            50%,
            70% {
            transform: translate3d(-4px, 0, 0);
            }
            40%,
            60% {
            transform: translate3d(4px, 0, 0);
            }
        }
        .pulse[data-v-f3fb3dc8] {
            animation: pulse-f3fb3dc8 2s ease infinite;
        }
        @keyframes pulse-f3fb3dc8 {
            0% {
            opacity: 0.7;
            }
            50% {
            opacity: 0.4;
            }
            100% {
            opacity: 0.7;
            }
        }
        .flash-once[data-v-f3fb3dc8] {
            animation: flash-once 3.5s ease 1;
        }
        @keyframes fade-up-f3fb3dc8 {
            0% {
            transform: translate3d(0, 10px, 0);
            opacity: 0;
            }
            100% {
            transform: translate3d(0, 0, 0);
            opacity: 1;
            }
        }
        .fade-in[data-v-f3fb3dc8] {
            animation: fade-in-f3fb3dc8 0.3s ease-in-out;
        }
        @keyframes fade-in-f3fb3dc8 {
            0% {
            opacity: 0;
            }
            100% {
            opacity: 1;
            }
        }
        .spin[data-v-f3fb3dc8] {
            animation-name: spin-f3fb3dc8;
            animation-duration: 2000ms;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
        }
        @keyframes spin-f3fb3dc8 {
            from {
            transform: rotate(0deg);
            }
            to {
            transform: rotate(360deg);
            }
        }
        .bounceIn[data-v-f3fb3dc8] {
            animation-name: bounceIn-f3fb3dc8;
            transform-origin: center bottom;
            animation-duration: 1s;
            animation-fill-mode: both;
            animation-iteration-count: 1;
        }
        @keyframes bounceIn-f3fb3dc8 {
            0%,
            20%,
            40%,
            60%,
            80%,
            100% {
            -webkit-transition-timing-function: cubic-bezier(
                0.215,
                0.61,
                0.355,
                1
            );
            transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            }
            0% {
            opacity: 1;
            -webkit-transform: scale3d(0.8, 0.8, 0.8);
            transform: scale3d(0.8, 0.8, 0.8);
            }
            20% {
            -webkit-transform: scale3d(1.1, 1.1, 1.1);
            transform: scale3d(1.1, 1.1, 1.1);
            }
            40% {
            -webkit-transform: scale3d(0.9, 0.9, 0.9);
            transform: scale3d(0.9, 0.9, 0.9);
            }
            60% {
            opacity: 1;
            -webkit-transform: scale3d(1.03, 1.03, 1.03);
            transform: scale3d(1.03, 1.03, 1.03);
            }
            80% {
            -webkit-transform: scale3d(0.97, 0.97, 0.97);
            transform: scale3d(0.97, 0.97, 0.97);
            }
            100% {
            opacity: 1;
            -webkit-transform: scale3d(1, 1, 1);
            transform: scale3d(1, 1, 1);
            }
        }
        @keyframes dots-f3fb3dc8 {
            0%,
            20% {
            color: rgba(0, 0, 0, 0);
            text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
            }
            40% {
            color: #8492a6;
            text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
            }
            60% {
            text-shadow: 0.25em 0 0 #8492a6, 0.5em 0 0 rgba(0, 0, 0, 0);
            }
            80%,
            100% {
            text-shadow: 0.25em 0 0 #8492a6, 0.5em 0 0 #8492a6;
            }
        }
        @keyframes recording-f3fb3dc8 {
            0% {
            box-shadow: 0px 0px 5px 0px rgba(173, 0, 0, 0.3);
            }
            65% {
            box-shadow: 0px 0px 5px 5px rgba(173, 0, 0, 0.3);
            }
            90% {
            box-shadow: 0px 0px 5px 5px rgba(173, 0, 0, 0);
            }
        }
        @font-face {
            font-family: 'Didact Gothic Regular';
            font-weight: normal;
            font-style: normal;
        }
        body[data-v-f3fb3dc8] {
            margin: 0;
            font-size: 100%;
            color: #3c4858;
        }
        a[data-v-f3fb3dc8] {
            text-decoration: none;
            color: #45c8f1;
        }
        h1[data-v-f3fb3dc8],
        h2[data-v-f3fb3dc8],
        h3[data-v-f3fb3dc8],
        h4[data-v-f3fb3dc8] {
            margin-top: 0;
        }
        svg[data-v-f3fb3dc8] {
            outline: none;
        }
        .container_selected_area[data-v-f3fb3dc8] {
            display: none;
            visibility: hidden;
            padding: 0;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2147483647;
        }
        .container_selected_area.active[data-v-f3fb3dc8] {
            visibility: visible;
            display: block;
        }
        .container_selected_area .label[data-v-f3fb3dc8] {
            font-family: 'Didact Gothic Regular', sans-serif;
            font-size: 22px;
            text-align: center;
            padding-top: 15px;
        }
        .area[data-v-f3fb3dc8] {
            display: none;
            position: absolute;
            z-index: 2147483647;
            pointer-events: none;
            border: 1px solid #1e83ff;
            background: rgba(30, 131, 255, 0.1);
            box-sizing: border-box;
        }
        .area.active[data-v-f3fb3dc8] {
            display: block;
            top: 0;
            left: 0;
        }
        .hide[data-v-f3fb3dc8] {
            display: none;
        }
        </style>
    </head>
    <body
        style='
        background-color: #f3f5f7;
        margin: 0 !important;
        padding: 0 !important;
        '
    >
        <!-- HIDDEN PREHEADER TEXT -->
        <div
        style='
            display: none;
            font-size: 1px;
            color: #fefefe;
            line-height: 1px;
            font-family: 'Lato', Helvetica, Arial, sans-serif;
            max-height: 0px;
            max-width: 0px;
            opacity: 0;
            overflow: hidden;
        '
        ></div>

        <table border='0' cellpadding='0' cellspacing='0' width='100%'>
        <!-- LOGO -->
        <tbody>
            <tr>
            <td bgcolor='#1B262C' align='center'>
                <!--[if (gte mso 9)|(IE)]>
                <table align='center' border='0' cellspacing='0' cellpadding='0' width='600'>
                <tr>
                <td align='center' valign='top' width='600'>
                <![endif]-->
                <table
                border='0'
                cellpadding='0'
                cellspacing='0'
                width='100%'
                style='max-width: 600px'
                >
                <tbody>
                    <tr>
                    <td
                        align='center'
                        valign='top'
                        style='padding: 80px 10px 80px 10px'
                    >
                        <h1>
                        <a
                            href='/'
                            target='_blank'
                            style='
                            text-decoration: none;
                            color: white;
                            font-family: Helvetica, Arial, sans-serif;
                            font-size: 50px;
                            '
                            >${env.PROJECT_NAME}</a
                        >
                        </h1>
                    </td>
                    </tr>
                </tbody>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
            </tr>
            <!-- HERO -->
            <tr>
            <td
                bgcolor='#1B262C'
                align='center'
                style='padding: 0px 10px 0px 10px'
            >
                <!--[if (gte mso 9)|(IE)]>
                <table align='center' border='0' cellspacing='0' cellpadding='0' width='600'>
                <tr>
                <td align='center' valign='top' width='600'>
                <![endif]-->
                <table
                border='0'
                cellpadding='0'
                cellspacing='0'
                width='100%'
                style='max-width: 600px'
                >
                <tbody>
                    <tr>
                    <td
                        bgcolor='#ffffff'
                        align='center'
                        valign='top'
                        style='
                        padding: 40px 20px 20px 20px;
                        border-radius: 4px 4px 0px 0px;
                        color: #111111;
                        font-family: 'Lato', Helvetica, Arial, sans-serif;
                        font-size: 48px;
                        font-weight: 400;
                        letter-spacing: 4px;
                        line-height: 48px;
                        '
                    >
                        <h1 style='font-size: 25px; font-weight: 400; margin: 0'>
                        Dear, ${name || 'User'}
                        </h1>
                    </td>
                    </tr>
                </tbody>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
            </tr>
            <!-- COPY BLOCK -->
            <tr>
            <td
                bgcolor='#f4f4f4'
                align='center'
                style='padding: 0px 10px 0px 10px'
            >
                <!--[if (gte mso 9)|(IE)]>
                <table align='center' border='0' cellspacing='0' cellpadding='0' width='600'>
                <tr>
                <td align='center' valign='top' width='600'>
                <![endif]-->
                <table
                border='0'
                cellpadding='0'
                cellspacing='0'
                width='100%'
                style='max-width: 600px'
                >
                <!-- COPY -->
                <tbody>
                    <tr>
                    <td
                        bgcolor='#ffffff'
                        align='left'
                        style='
                        padding: 20px 30px 40px 30px;
                        color: #666666;
                        font-family: 'Lato', Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        font-weight: 400;
                        line-height: 25px;
                        '
                    >
                        <p
                        style='
                            margin-top: 20px;
                            text-align: center;
                            line-height: 30px;
                        '
                        >
                        Please user code below to verify your account. The code
                        will expire in 5 minutes from the time it was sent.
                        </p>
                    </td>
                    </tr>
                    <tr>
                    <td bgcolor='#ffffff' align='left'>
                        <table
                        width='100%'
                        border='0'
                        cellspacing='0'
                        cellpadding='0'
                        >
                        <tbody>
                            <tr>
                            <td
                                bgcolor='#ffffff'
                                align='center'
                                style='padding: 0px 30px 0px 30px'
                            >
                                <table border='0' cellspacing='0' cellpadding='0'>
                                <tbody>
                                    <tr>
                                    <td
                                        align='center'
                                        style='border-radius: 0px'
                                        bgcolor='#1B262C'
                                    >
                                        <div
                                        style='
                                            font-size: 18px;
                                            font-family: Helvetica, Arial,
                                            sans-serif;
                                            color: #ffffff;
                                            text-decoration: none;
                                            color: #ffffff;
                                            text-decoration: none;
                                            padding: 12px 50px;
                                            border-radius: 2px;
                                            border: 1px solid;
                                            display: inline-block;
                                        '
                                        >
                                        ${otp}
                                        </div>
                                    </td>
                                    </tr>
                                </tbody>
                                </table>
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </td>
                    </tr>
                    <tr>
                    <td
                        bgcolor='#ffffff'
                        align='left'
                        style='
                        padding: 20px 30px 40px 30px;
                        color: #666666;
                        font-family: 'Lato', Helvetica, Arial, sans-serif;
                        font-size: 16px;
                        font-weight: 400;
                        line-height: 25px;
                        '
                    >
                        <p
                        style='
                            margin-top: 20px;
                            text-align: center;
                            line-height: 30px;
                        '
                        >
                        If you received this email by mistake or weren't
                        expecting, please disagree this email. For any questions
                        or concerns, please contact our
                        <b><font color='#1B262C'>Customer Service</font></b> team
                        at
                        <a
                            href='/'
                            target='_blank'
                            style='color: #666666; text-decoration: none'
                            >support@${env.PROJECT_NAME}.in</a
                        >
                        </p>
                    </td>
                    </tr>
                    <tr>
                    <td
                        bgcolor='#ffffff'
                        align='left'
                        style='
                        padding: 0px 30px 40px 30px;
                        border-radius: 0px 0px 4px 4px;
                        color: #666666;
                        font-family: 'Lato', Helvetica, Arial, sans-serif;
                        font-size: 14px;
                        font-weight: 400;
                        line-height: 25px;
                        '
                    >
                        <p
                        style='
                            margin-bottom: 30px;
                            font-size: 20px;
                            text-align: center;
                        '
                        >
                        Team
                        </p>
                        <p style='margin: 0; text-align: center; font-size: 20px'>
                        <b>${env.PROJECT_NAME}</b>
                        </p>
                    </td>
                    </tr>
                </tbody>
                </table>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
            </tr>
        </tbody>
        </table>

        <div id='scrnli_recorder_root'></div>
        <iframe
        src='chrome-extension://ijejnggjjphlenbhmjhhgcdpehhacaal/audio-devices.html'
        allow='microphone'
        style='display: none'
        ></iframe
        ><input type='file' id='' name='file' style='display: none' />
        <div data-v-f3fb3dc8=''>
        <div
            data-v-f3fb3dc8=''
            class='container_selected_area'
            style='cursor: crosshair'
        ></div>
        <div
            data-v-f3fb3dc8=''
            class='area'
            style='left: 0px; top: 0px; width: 0px; height: 0px'
        ></div>
        </div>
    </body>
    </html>`;
  },
};
