import struct
from struct import unpack
import json
import numpy as np
from matplotlib import pyplot as plt
import os


# def unpack_drawing(file_handle):
#     key_id, = unpack('Q', file_handle.read(8))
#     country_code, = unpack('2s', file_handle.read(2))
#     recognized, = unpack('b', file_handle.read(1))
#     timestamp, = unpack('I', file_handle.read(4))
#     n_strokes, = unpack('H', file_handle.read(2))
#     image = []
#     for i in range(n_strokes):
#         n_points, = unpack('H', file_handle.read(2))
#         fmt = str(n_points) + 'B'
#         x = unpack(fmt, file_handle.read(n_points))
#         y = unpack(fmt, file_handle.read(n_points))
#         image.append((x, y))

#     return {
#         'key_id': key_id,
#         'country_code': country_code,
#         'recognized': recognized,
#         'timestamp': timestamp,
#         'image': image
#     }

def extract_data(path):
    with open(path,'r') as f:
        images = np.load(path)
        perc = 0.7*len(images)
    return images[:int(perc)]

drawing = []
filename = "S:\programs\draw\data\\npy_data\\airplane.npy"
datadir = 'S:\programs\draw\data\\npy_data'
filenames = os.listdir(datadir)

# images = np.load(filename)
# print(images.shape)
# idx = np.random.randint(0,len(images))
# samp_image = np.reshape(images[idx],(28,28))
# plt.imshow(samp_image)
# plt.show()
# with open(filename,'r') as f:
#     data = f.readline()
#     datadict = json.loads(data)
#     drawing.update({datadict["word"]:datadict["drawing"]})

# # image = np.array(drawing["airplane"])
# print(np.array(drawing["airplane"],dtype=np.int32))

for filename in filenames:
    drawing.append(extract_data(f'{datadir}\{filename}'))

print(len(drawing[1]))
print(drawing[1][0].shape)
# for d in drawing:
#     print(d.shape)
# idx = np.random.randint(0,len(drawing))
# samp_image = np.reshape(drawing[idx],(28,28))
# plt.imshow(samp_image)
# plt.show()
a = np.random.randn(5,3)
b = np.random.randn(5,3)
print(a)
print()
print(b)
c = np.concatenate(drawing,axis=0)
print(c.shape)
print(c)