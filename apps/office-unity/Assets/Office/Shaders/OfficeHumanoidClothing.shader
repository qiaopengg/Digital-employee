Shader "DigitalEmployee/OfficeHumanoidClothing"
{
    Properties
    {
        _ShirtColor ("Shirt", Color) = (0.12, 0.35, 0.56, 1)
        _PantsColor ("Pants", Color) = (0.12, 0.14, 0.18, 1)
        _ShoeColor ("Shoes", Color) = (0.04, 0.05, 0.07, 1)
        _GarmentMinY ("Garment minimum", Float) = 0.02
        _ShoeEndY ("Shoe end", Float) = 0.20
        _ShirtStartY ("Shirt start", Float) = 0.88
        _GarmentMaxY ("Garment maximum", Float) = 1.86
        _SurfaceOffset ("Surface offset", Float) = 0.012
    }

    SubShader
    {
        Tags
        {
            "RenderType" = "Opaque"
            "RenderPipeline" = "UniversalPipeline"
            "Queue" = "Geometry+2"
        }

        Pass
        {
            Name "ForwardLit"
            Tags { "LightMode" = "UniversalForward" }
            Cull Back
            ZWrite On

            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag
            #pragma multi_compile_instancing
            #pragma multi_compile _ _MAIN_LIGHT_SHADOWS _MAIN_LIGHT_SHADOWS_CASCADE

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float3 normalOS : NORMAL;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float3 positionWS : TEXCOORD0;
                half3 normalWS : TEXCOORD1;
                float localY : TEXCOORD2;
                float4 shadowCoord : TEXCOORD3;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            CBUFFER_START(UnityPerMaterial)
                half4 _ShirtColor;
                half4 _PantsColor;
                half4 _ShoeColor;
                float _GarmentMinY;
                float _ShoeEndY;
                float _ShirtStartY;
                float _GarmentMaxY;
                float _SurfaceOffset;
            CBUFFER_END

            Varyings Vert(Attributes input)
            {
                Varyings output;
                UNITY_SETUP_INSTANCE_ID(input);
                UNITY_TRANSFER_INSTANCE_ID(input, output);

                float3 positionOS = input.positionOS.xyz + input.normalOS * _SurfaceOffset;
                output.positionWS = TransformObjectToWorld(positionOS);
                output.localY = output.positionWS.y;
                output.positionCS = TransformWorldToHClip(output.positionWS);
                output.normalWS = TransformObjectToWorldNormal(input.normalOS);
                output.shadowCoord = TransformWorldToShadowCoord(output.positionWS);
                return output;
            }

            half4 Frag(Varyings input) : SV_Target
            {
                UNITY_SETUP_INSTANCE_ID(input);
                clip(input.localY - _GarmentMinY);
                clip(_GarmentMaxY - input.localY);

                half3 garmentColor = input.localY < _ShoeEndY
                    ? _ShoeColor.rgb
                    : input.localY < _ShirtStartY
                        ? _PantsColor.rgb
                        : _ShirtColor.rgb;
                Light mainLight = GetMainLight(input.shadowCoord);
                half diffuse = saturate(dot(normalize(input.normalWS), mainLight.direction));
                half lightAmount = 0.48h + diffuse * 0.52h * mainLight.shadowAttenuation;
                return half4(garmentColor * lightAmount * mainLight.color, 1.0h);
            }
            ENDHLSL
        }
    }
}
