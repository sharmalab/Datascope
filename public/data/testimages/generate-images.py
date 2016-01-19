import numpy, Image

for n in xrange(10000):
    a = numpy.random.rand(64,64,3) * 255
    im_out = Image.fromarray(a.astype('uint8')).convert('RGBA')
    im_out.save('%000d.jpg' % n)