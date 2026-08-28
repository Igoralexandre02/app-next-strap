/**
 * @param {{ env: (key: string, defaultValue?: string) => string }} params
 */
module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
      jwt: {
        expiresIn: '1h',
      },
    },
  },

  upload: {
    config: {
      provider: 'cloudinary',

      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },

      security: {
        allowedTypes: [
          'image/*',
          'video/*',
          'audio/*',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.*',
          'text/plain',
          'text/csv',
        ],

        deniedTypes: [
          'application/vnd.microsoft.portable-executable',
          'application/x-msdownload',
          'application/x-msdos-program',
          'application/x-executable',
          'application/x-dosexec',
          'application/x-sh',
          'text/x-shellscript',
          'application/x-mach-binary',
        ],
      },

      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});