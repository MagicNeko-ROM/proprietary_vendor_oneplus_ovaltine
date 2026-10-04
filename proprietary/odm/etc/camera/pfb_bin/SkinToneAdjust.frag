#version 320 es

precision mediump float;
uniform sampler2D ori_img;
uniform sampler2D skinLUT;
uniform sampler2D face_mask;
uniform lowp float whiteLevel;
// uniform float target_degree;

in vec2 v_texCoord;
out vec4 FragColor;

highp vec3 YUV2RGB(vec3 yuv)
{
    highp vec3 rgb;
    rgb.r = yuv.r + 1.370705 * (yuv.b - 0.5);
    rgb.g = yuv.r - 0.698001*(yuv.b - 0.5) - 0.337633*(yuv.g - 0.5);
    rgb.b = yuv.r + 1.732446*(yuv.g - 0.5);
    return rgb;
}

highp vec3 RGB2YUV(vec3 rgb)
{
    highp vec3 yuv;
    yuv.r = 0.298822*rgb.r + 0.586815*rgb.g + 0.114363*rgb.b;
    yuv.b = 0.511545*rgb.r - 0.428112*rgb.g - 0.083434*rgb.b + 0.5;
    yuv.g = -0.172486*rgb.r - 0.338720*rgb.g + 0.511206*rgb.b + 0.5;
    return yuv;
}

highp vec4 LOOKUP16(vec4 textureColor, sampler2D table, float strength)
{
    highp float blueColor = textureColor.b * 15.0;
    highp vec2 quad1;
    quad1.y = floor(floor(blueColor) / 4.0);
    quad1.x = floor(blueColor) - (quad1.y * 4.0);
    highp vec2 quad2;
    quad2.y = floor(ceil(blueColor) /4.0);
    quad2.x = ceil(blueColor) - (quad2.y * 4.0);
    highp vec2 texPos1;
    texPos1.x = (quad1.x * 1.0/4.0) + 0.5/64.0 + ((1.0/4.0 - 1.0/64.0) * clamp(textureColor.r, 0.0, (1.0 - 1.0 / 16.0)));
    texPos1.y = (quad1.y * 1.0/4.0) + 0.5/64.0 + ((1.0/4.0 - 1.0/64.0) * clamp(textureColor.g, 0.0, (1.0 - 1.0 / 16.0)));
    highp vec2 texPos2;
    texPos2.x = (quad2.x * 1.0/4.0) + 0.5/64.0 + ((1.0/4.0 - 1.0/64.0) * clamp(textureColor.r, 0.0, (1.0 - 1.0 / 16.0)));
    texPos2.y = (quad2.y * 1.0/4.0) + 0.5/64.0 + ((1.0/4.0 - 1.0/64.0) * clamp(textureColor.g, 0.0, (1.0 - 1.0 / 16.0)));
    lowp vec4 newColor1 = texture2D(table, texPos1);
    lowp vec4 newColor2 = texture2D(table, texPos2);
    lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
    return mix(textureColor, vec4(newColor.rgb, textureColor.w), strength);
}

highp vec4 LOOKUP64(vec4 textureColor, sampler2D table, float strength)
{
    highp float blueColor = textureColor.b * 63.0;
    highp vec2 quad1;
    quad1.y = floor(floor(blueColor) / 8.0);
    quad1.x = floor(blueColor) - (quad1.y * 8.0);
    highp vec2 quad2;
    quad2.y = floor(ceil(blueColor) /8.0);
    quad2.x = ceil(blueColor) - (quad2.y * 8.0);
    highp vec2 texPos1;
    texPos1.x = (quad1.x * 1.0/8.0) + 0.5/512.0 + ((1.0/8.0 - 1.0/512.0) * clamp(textureColor.r, 0.0, (1.0 - 1.0 / 64.0)));
    texPos1.y = (quad1.y * 1.0/8.0) + 0.5/512.0 + ((1.0/8.0 - 1.0/512.0) * clamp(textureColor.g, 0.0, (1.0 - 1.0 / 64.0)));
    highp vec2 texPos2;
    texPos2.x = (quad2.x * 1.0/8.0) + 0.5/512.0 + ((1.0/8.0 - 1.0/512.0) * clamp(textureColor.r, 0.0, (1.0 - 1.0 / 64.0)));
    texPos2.y = (quad2.y * 1.0/8.0) + 0.5/512.0 + ((1.0/8.0 - 1.0/512.0) * clamp(textureColor.g, 0.0, (1.0 - 1.0 / 64.0)));
    lowp vec4 newColor1 = texture2D(table, texPos1);
    lowp vec4 newColor2 = texture2D(table, texPos2);
    lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
    return mix(textureColor, vec4(newColor.rgb, textureColor.w), strength);
}

void main(void)
{
    lowp vec4 base_color = texture(ori_img, v_texCoord);
    lowp vec4 mask_color = texture(face_mask, v_texCoord);
    if (ratio != 0.0 && mask_color.r > 0.0) {
        lowp float maskValue = mask_color.r;//(mask_color.r >= 0.5 && mask_color.r < 1.0) ? 1.0 : 0.0;
        lowp float level = max(maskValue, whiteLevelMin);
        mediump vec4 res_color = LOOKUP64(base_color, skinLUT, level);

        FragColor.rgb = RGB2YUV(res_color.rgb);
    } else {
        FragColor.rgb = RGB2YUV(base_color);
    }
    FragColor.a = 1.;
}
