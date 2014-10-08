
var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , templatePath = path.normalize(__dirname + '/../app/mailer/templates')
  , notifier = {
      service: 'postmark',
      APN: false,
      email: false, // true
      actions: ['comment'],
      tplPath: templatePath,
      key: 'POSTMARK_KEY',
      parseAppId: 'PARSE_APP_ID',
      parseApiKey: 'PARSE_MASTER_KEY'
    }

module.exports = {
  development: {
    db: 'mongodb://localhost/game',
    db_session: 'mongodb://localhost/game',
    session_maxAge: 7 * 24 * 3600 * 1000, // session expire in a week
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'game'
    },
    host: 'http://local.game.co:3000',
    port: 3000,
    ipaddr: 'localhost',
    mandrill_key: 'mz1vfbrXlLp5eMtTH4IsRA',
    google_analytics:'UA-50368100-1',
    stripe:{
      clientID:'ca_41ZITFcIWggnlSRPX7fqm35BKNJ1ho8K',
      publishableKey: 'pk_test_WJdNp3TqE1XSUbIlUmFdZ14p',
      clientSecret:'sk_test_5XBMtCdNECpBHVZ4xKCVTTI1',
    },
    recaptcha:{
      public_key : '6Lc9ZvASAAAAAE0hyPOudSIeF4jtsuOpUuRVCudU',
      private_key: '6Lc9ZvASAAAAAFgPDunNSNxhPjBRsjU-PspY3vM8'
    },
    liverate:{
      key: '5397b58f5527380ff9853a9c',
      secret: 'WfrU4wLkOmpglq2N1JcWTLyO537H4wHn'
    },
    facebook: {
      clientID: "600081943451020",
      clientSecret: "56b9658dc94be9801ed504cf442e1fdd",
      callbackURL: "/auth/facebook/callback"
    },
    linkedin: {
      clientID: "77csvkc000gx41",
      clientSecret: "U60c7dltBaxH6uX9",
      callbackURL: "/auth/linkedin/callback"
    },
    wechat: {
      clientID: "wx85dbfe3c6e6b1b13",
      clientSecret: "8a9bef8c5794b3a448b85d90072c4a41",
      callbackURL: "/auth/wechat/callback"
    }
  },
  beta: {
    db: process.env.OPENSHIFT_MONGODB_DB_URL+'beta',
    db_session: process.env.OPENSHIFT_MONGODB_DB_URL+'beta',
    session_maxAge: 7 * 24 * 3600 * 1000, // session expire in a week
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'game'
    },
    host: 'http://beta-game.rhcloud.com',
    port: process.env.OPENSHIFT_NODEJS_PORT ||  process.env.OPENSHIFT_INTERNAL_PORT || 8080,
    ipaddr: process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP,
    mandrill_key: 'mz1vfbrXlLp5eMtTH4IsRA',
    google_analytics:'UA-50368100-1',
    stripe:{
      clientID:'ca_41ZITFcIWggnlSRPX7fqm35BKNJ1ho8K',
      publishableKey: 'pk_test_WJdNp3TqE1XSUbIlUmFdZ14p',
      clientSecret:'sk_test_5XBMtCdNECpBHVZ4xKCVTTI1',
    },
    recaptcha:{
      public_key : '6Lc9ZvASAAAAAE0hyPOudSIeF4jtsuOpUuRVCudU',
      private_key: '6Lc9ZvASAAAAAFgPDunNSNxhPjBRsjU-PspY3vM8'
    },
    liverate:{
      key: '5397b58f5527380ff9853a9c',
      secret: 'WfrU4wLkOmpglq2N1JcWTLyO537H4wHn'
    },
    facebook: {
      clientID: "455469451255018",
      clientSecret: "da82755047a3d646f30ed79de96120d2",
      callbackURL: "/auth/facebook/callback"
    },
    linkedin: {
      clientID: "77ijyflm8pggo7",
      clientSecret: "pvZ80V7aJw2Vv0W8",
      callbackURL: "/auth/linkedin/callback"
    }
  },
  production: {
    db: process.env.OPENSHIFT_MONGODB_DB_URL+'game',
    db_session: process.env.OPENSHIFT_MONGODB_DB_URL+'game',
    session_maxAge: 24 * 3600 * 1000, // session expire in a day, due to low capacity of mongo storage
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'game'
    },
    host: 'http://www.game.co',
    port: process.env.OPENSHIFT_NODEJS_PORT ||  process.env.OPENSHIFT_INTERNAL_PORT || 8080,
    ipaddr: process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP,
    mandrill_key: 'mz1vfbrXlLp5eMtTH4IsRA',
    google_analytics:'UA-54785427-1',
    stripe:{
      clientID:'ca_41ZIsLXQTpEXl2WVS1jToaSU33j7Q7iW',
      publishableKey: 'pk_live_tVFA0f9CBBq9cVYQgYxEUEge',
      clientSecret:'sk_live_VMH7bZOgxGWa1IZ55NkuXtMf'
    },
    recaptcha:{
      public_key : '6Lc9ZvASAAAAAE0hyPOudSIeF4jtsuOpUuRVCudU',
      private_key: '6Lc9ZvASAAAAAFgPDunNSNxhPjBRsjU-PspY3vM8'
    },
    liverate:{
      key: '5397b58f5527380ff9853a9c',
      secret: 'WfrU4wLkOmpglq2N1JcWTLyO537H4wHn'
    },
    facebook: {
      clientID: "1533772743501165",
      clientSecret: "96f7ffb52007d2dbf640b6885a9c5cd3",
      callbackURL: "/auth/facebook/callback"
    },
    linkedin: {
      clientID: "77sjp2k0wioqy4",
      clientSecret: "FEtUOsYIpV8zQwZE",
      callbackURL: "/auth/linkedin/callback"
    }
  },
  live: {
    db: 'mongodb://localhost/game',
    db_session: 'mongodb://localhost/game',
    session_maxAge: 24 * 3600 * 1000, // session expire in a day, due to low capacity of mongo storage
    root: rootPath,
    notifier: notifier,
    app: {
      name: 'game'
    },
    host: 'http://www.game.co',
    port: 8080,
    ipaddr: 'localhost',
    mandrill_key: 'mz1vfbrXlLp5eMtTH4IsRA',
    google_analytics:'UA-54785427-1',
    stripe:{
      clientID:'ca_41ZIsLXQTpEXl2WVS1jToaSU33j7Q7iW',
      publishableKey: 'pk_live_tVFA0f9CBBq9cVYQgYxEUEge',
      clientSecret:'sk_live_VMH7bZOgxGWa1IZ55NkuXtMf'
    },
    recaptcha:{
      public_key : '6Lc9ZvASAAAAAE0hyPOudSIeF4jtsuOpUuRVCudU',
      private_key: '6Lc9ZvASAAAAAFgPDunNSNxhPjBRsjU-PspY3vM8'
    },
    liverate:{
      key: '5397b58f5527380ff9853a9c',
      secret: 'WfrU4wLkOmpglq2N1JcWTLyO537H4wHn'
    },
    facebook: {
      clientID: "1533772743501165",
      clientSecret: "96f7ffb52007d2dbf640b6885a9c5cd3",
      callbackURL: "/auth/facebook/callback"
    },
    linkedin: {
      clientID: "77sjp2k0wioqy4",
      clientSecret: "FEtUOsYIpV8zQwZE",
      callbackURL: "/auth/linkedin/callback"
    },
    wechat: {
      clientID: "wx85dbfe3c6e6b1b13",
      clientSecret: "8a9bef8c5794b3a448b85d90072c4a41",
      callbackURL: "/auth/wechat/callback"
    }
  }
}
