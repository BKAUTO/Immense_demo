#! /bin/bash

function read_dir() {

for file in `ls $1`

do

    if [ -d $1"/"$file ] 

    then

    read_dir $1"/"$file

    else

    echo $file
    sudo cat $file > $file.out
    fi

done

}
read_dir .
