from PIL import Image
import numpy as np

img = Image.open('public/logo.png').convert('RGBA')
data = np.array(img)

r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

# Make near-white pixels fully transparent
white_mask = (r > 230) & (g > 230) & (b > 230)
data[white_mask, 3] = 0

result = Image.fromarray(data)
result.save('public/logo.png')
print("White background removed from logo.png")
