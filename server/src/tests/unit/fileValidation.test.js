import {
  validateProfileImage,
  validateResume,
  validateCompanyLogo
} from "../../utils/fileValidation.js";

import {
  PROFILE_IMAGE,
  COMPANY_LOGO,
  RESUME
} from "../../constants/upload.constants.js";

describe(
  "File validation utility",
  () => {
    const createFile = (
      overrides = {}
    ) => ({
      originalname:
        "sample.png",

      mimetype:
        "image/png",

      size:
        1024,

      buffer:
        Buffer.from(
          "file-content"
        ),

      ...overrides
    });

    describe(
      "validateProfileImage",
      () => {
        test.each([
          [
            "profile.jpg",
            "image/jpeg",
            ".jpg"
          ],
          [
            "profile.jpeg",
            "image/jpeg",
            ".jpeg"
          ],
          [
            "profile.png",
            "image/png",
            ".png"
          ],
          [
            "profile.webp",
            "image/webp",
            ".webp"
          ]
        ])(
          "accepts valid profile image %s",
          (
            originalname,
            mimetype,
            extension
          ) => {
            const file =
              createFile({
                originalname,
                mimetype
              });

            const result =
              validateProfileImage(
                file
              );

            expect(result).toEqual({
              extension,
              originalName:
                originalname,
              mimeType:
                mimetype,
              size:
                file.size
            });
          }
        );

        test(
          "accepts profile image at maximum allowed size",
          () => {
            const file =
              createFile({
                size:
                  PROFILE_IMAGE
                    .MAX_SIZE
              });

            expect(
              validateProfileImage(
                file
              )
            ).toEqual(
              expect.objectContaining({
                size:
                  PROFILE_IMAGE
                    .MAX_SIZE
              })
            );
          }
        );

        test(
          "rejects missing profile image",
          () => {
            expect(() =>
              validateProfileImage(
                undefined
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "FILE_REQUIRED"
              })
            );
          }
        );

        test(
          "rejects profile image with invalid buffer",
          () => {
            const file =
              createFile({
                buffer:
                  "not-a-buffer"
              });

            expect(() =>
              validateProfileImage(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "INVALID_FILE_CONTENT"
              })
            );
          }
        );

        test(
          "rejects an empty profile image",
          () => {
            const file =
              createFile({
                size:
                  0
              });

            expect(() =>
              validateProfileImage(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "EMPTY_FILE"
              })
            );
          }
        );

        test(
          "rejects profile image larger than allowed size",
          () => {
            const file =
              createFile({
                size:
                  PROFILE_IMAGE
                    .MAX_SIZE + 1
              });

            expect(() =>
              validateProfileImage(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  413,

                code:
                  "FILE_TOO_LARGE"
              })
            );
          }
        );

        test(
          "rejects unsupported profile image MIME type",
          () => {
            const file =
              createFile({
                originalname:
                  "profile.png",

                mimetype:
                  "image/gif"
              });

            expect(() =>
              validateProfileImage(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  415,

                code:
                  "UNSUPPORTED_FILE_TYPE"
              })
            );
          }
        );

        test(
          "rejects unsupported profile image extension",
          () => {
            const file =
              createFile({
                originalname:
                  "profile.gif",

                mimetype:
                  "image/png"
              });

            expect(() =>
              validateProfileImage(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  415,

                code:
                  "UNSUPPORTED_FILE_EXTENSION"
              })
            );
          }
        );

        test(
          "normalizes uppercase profile image extension",
          () => {
            const file =
              createFile({
                originalname:
                  "profile.PNG",

                mimetype:
                  "image/png"
              });

            const result =
              validateProfileImage(
                file
              );

            expect(
              result.extension
            ).toBe(
              ".png"
            );
          }
        );
      }
    );

    describe(
      "validateCompanyLogo",
      () => {
        test.each([
          [
            "logo.jpg",
            "image/jpeg",
            ".jpg"
          ],
          [
            "logo.jpeg",
            "image/jpeg",
            ".jpeg"
          ],
          [
            "logo.png",
            "image/png",
            ".png"
          ],
          [
            "logo.webp",
            "image/webp",
            ".webp"
          ]
        ])(
          "accepts valid company logo %s",
          (
            originalname,
            mimetype,
            extension
          ) => {
            const file =
              createFile({
                originalname,
                mimetype
              });

            const result =
              validateCompanyLogo(
                file
              );

            expect(result).toEqual({
              extension,
              originalName:
                originalname,
              mimeType:
                mimetype,
              size:
                file.size
            });
          }
        );

        test(
          "accepts company logo at maximum allowed size",
          () => {
            const file =
              createFile({
                originalname:
                  "logo.png",

                size:
                  COMPANY_LOGO
                    .MAX_SIZE
              });

            expect(
              validateCompanyLogo(
                file
              )
            ).toEqual(
              expect.objectContaining({
                size:
                  COMPANY_LOGO
                    .MAX_SIZE
              })
            );
          }
        );

        test(
          "rejects missing company logo",
          () => {
            expect(() =>
              validateCompanyLogo(
                null
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "FILE_REQUIRED"
              })
            );
          }
        );

        test(
          "rejects oversized company logo",
          () => {
            const file =
              createFile({
                originalname:
                  "logo.png",

                size:
                  COMPANY_LOGO
                    .MAX_SIZE + 1
              });

            expect(() =>
              validateCompanyLogo(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  413,

                code:
                  "FILE_TOO_LARGE"
              })
            );
          }
        );

        test(
          "rejects unsupported company logo MIME type",
          () => {
            const file =
              createFile({
                originalname:
                  "logo.png",

                mimetype:
                  "application/pdf"
              });

            expect(() =>
              validateCompanyLogo(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  415,

                code:
                  "UNSUPPORTED_FILE_TYPE"
              })
            );
          }
        );

        test(
          "rejects unsupported company logo extension",
          () => {
            const file =
              createFile({
                originalname:
                  "logo.svg",

                mimetype:
                  "image/png"
              });

            expect(() =>
              validateCompanyLogo(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  415,

                code:
                  "UNSUPPORTED_FILE_EXTENSION"
              })
            );
          }
        );
      }
    );

    describe(
      "validateResume",
      () => {
        test.each([
          [
            "resume.pdf",
            "application/pdf",
            ".pdf"
          ],
          [
            "resume.doc",
            "application/msword",
            ".doc"
          ],
          [
            "resume.docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".docx"
          ]
        ])(
          "accepts valid resume %s",
          (
            originalname,
            mimetype,
            extension
          ) => {
            const file =
              createFile({
                originalname,
                mimetype
              });

            const result =
              validateResume(
                file
              );

            expect(result).toEqual({
              extension,
              originalName:
                originalname,
              mimeType:
                mimetype,
              size:
                file.size
            });
          }
        );

        test(
          "accepts resume at maximum allowed size",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.pdf",

                mimetype:
                  "application/pdf",

                size:
                  RESUME.MAX_SIZE
              });

            expect(
              validateResume(
                file
              )
            ).toEqual(
              expect.objectContaining({
                size:
                  RESUME.MAX_SIZE
              })
            );
          }
        );

        test(
          "rejects missing resume",
          () => {
            expect(() =>
              validateResume(
                undefined
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "FILE_REQUIRED"
              })
            );
          }
        );

        test(
          "rejects resume with invalid buffer",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.pdf",

                mimetype:
                  "application/pdf",

                buffer:
                  null
              });

            expect(() =>
              validateResume(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "INVALID_FILE_CONTENT"
              })
            );
          }
        );

        test(
          "rejects empty resume",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.pdf",

                mimetype:
                  "application/pdf",

                size:
                  0
              });

            expect(() =>
              validateResume(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  400,

                code:
                  "EMPTY_FILE"
              })
            );
          }
        );

        test(
          "rejects oversized resume",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.pdf",

                mimetype:
                  "application/pdf",

                size:
                  RESUME.MAX_SIZE + 1
              });

            expect(() =>
              validateResume(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  413,

                code:
                  "FILE_TOO_LARGE"
              })
            );
          }
        );

        test(
          "rejects unsupported resume MIME type",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.pdf",

                mimetype:
                  "text/plain"
              });

            expect(() =>
              validateResume(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  415,

                code:
                  "UNSUPPORTED_FILE_TYPE"
              })
            );
          }
        );

        test(
          "rejects unsupported resume extension",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.txt",

                mimetype:
                  "application/pdf"
              });

            expect(() =>
              validateResume(
                file
              )
            ).toThrow(
              expect.objectContaining({
                statusCode:
                  415,

                code:
                  "UNSUPPORTED_FILE_EXTENSION"
              })
            );
          }
        );

        test(
          "normalizes uppercase resume extension",
          () => {
            const file =
              createFile({
                originalname:
                  "resume.PDF",

                mimetype:
                  "application/pdf"
              });

            const result =
              validateResume(
                file
              );

            expect(
              result.extension
            ).toBe(
              ".pdf"
            );
          }
        );
      }
    );
  }
);