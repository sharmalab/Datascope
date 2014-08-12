import string
import random
num_recs = 1000000
print "["
for i in range(0, num_recs):
    print "{"
    print "\"id\": "+str(random.randint(1000000,9999999))+","
    print "\"guid\": "+str(random.randint(100000000,999999999999))+","
    print "\"name\": \"" + ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(12))+"\","
    print "\"registered\": \"" + ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))+"\","
    print "\"isActive\": "+str(random.choice(["true","false"]))+","
    print "\"gender\": \"" +random.choice(["male", "female"])+"\","
    print "\"age\": " +str(random.randint(20,40))+","
    print "\"Ai\": " + str(random.randint(0,10)) + ","
    print "\"Bi\": " + str(random.randint(0,8)) + ","
    print "\"Ci\": "+ str(random.randint(0,12)) + ","
    print "\"Di\": "+str(random.randint(4,10)) + ","
    print "\"Eb\": "+str(random.choice(["true","false"]))+","
    print "\"Ff\": "+str(random.uniform(12,100))+","
    print "\"Gf\": "+str(random.uniform(0,1))+","
    print "\"Hf\": "+str(random.uniform(0,1))+","
    print "\"Ji\": "+str(random.randint(0,100)) + ","
    print "\"Ki\": "+str(random.randint(100,200))+","
    print "\"Li\": "+str(random.randint(0,1000))+","
    print "\"Ms\": \""+str(random.choice(["str1", "str2", "str3"]))+"\","
    print "\"Ns\": \""+str(random.choice(["s1","s2","s3","s4"]))+"\","
    print "\"Oi\": "+str(random.randint(0,5)) 
    '''
    + ","
    print "\"Pi\": "+str(random.randint(0,100)) + ","
    print "\"Qs\": \""+str(random.choice(["s0", "s1"])) + "\","
    print "\"Ri\": "+str(random.randint(10,20)) + ","
    print "\"Si\": "+str(random.randint(100,120)) +","
    print "\"Ti\": "+str(random.randint(100,120)) +","
    print "\"Ui\": "+str(random.randint(100,120)) +","
    print "\"Vi\": "+str(random.randint(100,120)) +","
    print "\"Wi\": "+str(random.randint(100,1200)) +","
    print "\"Xi\": "+str(random.randint(100,1200)) 
    '''
    if i == num_recs - 1 :
        print "}"
        print "]"
    else:
        print "},"

