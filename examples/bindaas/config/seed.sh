until mongo --host ds-mongo --eval "print(\"waited for connection\")" > /dev/null
do
    sleep 2
done

mongo --host ds-mongo data /config/seed.js
