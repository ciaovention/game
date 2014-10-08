module.exports = {
  variants: {
    avatar: {
      resizeAndCrop: {
        large: {
          resize: '400x400',
          crop: '400x400'
        },
        thumbnail: {
          resize: '150x150',
          crop: '150x150'
        }
      }
    },
    qr: {
      keepNames: true,
      resize: {
        '' : '100x100'
      }
    }
  },

  storage: {
    S3: {
      key: 'AKIAICV3HLFCK6JD64MA',
      secret: '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',
      bucket: 'profile-newbrain',
      cdn: 'https://d2okfajvs3iw45.cloudfront.net'
    },
    uploadDirectory:''
  },

  debug: true
}
