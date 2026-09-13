import sys
import torch
import os
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"
os.environ["TRANSFORMERS_VERBOSITY"] = "error"
from diffusers import StableDiffusionPipeline

def main():
    if len(sys.argv) < 3:
        print("Usage: python generate.py <prompt> <output_path>")
        sys.exit(1)
        
    base_prompt = sys.argv[1]
    output_path = sys.argv[2]
    
    # Enhance the prompt specifically for the tiny-sd model to force high quality pixel art
    prompt = f"masterpiece, best quality, retro 16-bit pixel art game cover, {base_prompt}, centered, symmetric, vibrant colors, highly detailed"
    negative_prompt = "blurry, low quality, deformed, realistic, text, watermark, bad anatomy, bad proportions, messy"
    
    # Tiny SD model optimized for extremely fast CPU/low-VRAM generation
    model_id = "nota-ai/bk-sdm-tiny"
    
    print(f"Loading {model_id}...")
    # Load pipeline
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id, 
        torch_dtype=torch.float32, 
        safety_checker=None
    )
    
    # We removed the progress bar disable config so logs stream to Node!
    
    print(f"Generating image for prompt: '{prompt}'...")
    # Generate image (25 steps allows the tiny model to resolve much better details)
    image = pipe(
        prompt, 
        negative_prompt=negative_prompt,
        num_inference_steps=25, 
        guidance_scale=8.0, 
        height=256, 
        width=256
    ).images[0]
    
    image.save(output_path)
    print(f"SUCCESS: Image saved to {output_path}")

if __name__ == "__main__":
    main()
