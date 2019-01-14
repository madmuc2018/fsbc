# FSBC
![](https://travis-ci.org/thailekha/fsbc.svg?branch=master)

# Build composer box on Windows:
vagrant destroy -f composer-empty
vagrant up composer-empty
vagrant ssh composer-empty
    cd /mnt/vagrant && make install-composer-prereq
    <ctrl+d for logout>
vagrant ssh composer-empty
    cd /mnt/vagrant && make install-composer-core && make test-business-network
    <ctrl+d for logout>
rm fsbc-composer.box || echo Box does not exist
vagrant package composer-empty --output fsbc-composer.box
vagrant box remove fsbc/composer || echo Box not previously added
vagrant box add fsbc/composer fsbc-composer.box
vagrant destroy -f composer-empty

# Create Dev VM
vagrant destroy -f dev-machine
vagrant up dev-machine
vagrant ssh dev-machine
    cd /mnt/vagrant && make singlenode
