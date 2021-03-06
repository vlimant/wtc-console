# WTC-Console

This project uses [Django React/Redux Base Project](https://github.com/Seedstars/django-react-redux-base) from Seedstarts as a boilerplate. Please refer to their github for the complete list of technologies used.


Here are the main tools whose knowledge is useful to contribute:

**Frontend**

* [React](https://github.com/facebook/react)
* [React Router](https://github.com/ReactTraining/react-router) Declarative routing for React
* [Webpack](http://webpack.github.io) for bundling
* [Redux](https://github.com/reactjs/redux) Predictable state container for JavaScript apps 
* [React Router Redux](https://github.com/reactjs/react-router-redux) Ruthlessly simple bindings to keep react-router and redux in sync
* [styled-components](https://github.com/styled-components/styled-components) Keeping styles and components in one place
* [font-awesome-webpack](https://github.com/gowravshekar/font-awesome-webpack) to customize FontAwesome

**Backend**

* [Django](https://www.djangoproject.com/)
* [Django REST framework](http://www.django-rest-framework.org/) Django REST framework is a powerful and flexible toolkit for building Web APIs
* [MongoEngine](https://github.com/MongoEngine/mongoengine) Python ODM for MongoDB
* [Celery](http://docs.celeryproject.org/en/latest/) Distributed tasks queue


## Setting up local environment

Prerequisites:
* Python >=2.7

### Setup steps

Clone this project:

* `git clone https://github.com/vined/wtc-console.git`
* `cd wtc-console/`

Frontend builds, MongoDB, PostgreSql and RabbitMQ are run in docker containers to shorten setup time

* Install [Docker](https://www.docker.com/products/overview) and [Docker Compose](https://docs.docker.com/compose/install/).
* `docker-compose build`

Running oracle client in docker container is not solved yet. Because of this, client has to be installed locally.

* Install [Oracle Instant Client](http://www.oracle.com/technetwork/database/database-technologies/instant-client/overview/index.html).
    * Setup tns config by putting tnsnames.ora from _/afs/cern.ch/project/oracle/admin/_ to projects _oracle-admin_ folder.
    Note: sometimes this config file changes, if you have problems connecting to oracle, then try to fetch a new version of this file
    * Add these lines to your _.bashrc_, probably the path to client will be _/usr/lib/oracle/xx.x/client64_, but it might be different depending on installation type
```
export ORACLE_HOME=/path/to/oracle/client
export LD_LIBRARY_PATH=$ORACLE_HOME/lib
export PATH=$PATH:$ORACLE_HOME/bin
```

* Copy _src/djangoreactredux/settings/local_template.py_ setting file to _src/djangoreactredux/settings/local.py_ and fill it with certificates data and Oracle db credentials
* `./bin/setup_dev.sh` - this will install Python requirements

### Running and stopping

To start up development environment after it is setup you need to run these two commands in separate console windows/tabs in this order

* `docker-compose up`
* `./bin/start_dev.sh`

To stop the development server:

* `./bin/stop_dev.sh` - this will stop celery workers
* `docker-compose stop` or _Ctrl+C_ if you have 'docker-compose up' running terminal

Note: it might take some time for celery workers to stop if they are in longer process. You can check if they are still running by executing:

`ps -ef | grep celery`

### Clean up

Stop Docker development server and remove containers, networks, volumes, and images created by up (to make a fresh start).

* `docker-compose down`

### Misc

You can access shell in a container

* `docker ps` - get the name from the list of running containers
* `docker exec -i -t djangoreactreduxbase_rabbitmq /bin/bash` - connects to container bash

The postgresql database can be accessed @localhost:5433

* `psql -h localhost -p 5433 -U djangoreactredux djangoreactredux_dev`

The mongo database can be accessed by connecting to docker instance with mongo client

* `mongo --host localhost`


## Accessing Website

Go to [localhost:8000](http://localhost:8000)


## Development guidelines

When developing a new feature create your own branch and push your changes at least daily.

Do not push directly to master. Create pull requests and assign someone to approve it. Go through your pull request your self, it helps to see if there is unwanted or commented-out code.


## Production

Production setup uses nginx as reverse proxy and Gunicorn as an application server.
Below are the steps needed to setup environment on RHEL from scratch. Instructions are based on this article [How To Set Up Django with Postgres, Nginx, and Gunicorn on CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-centos-7#create-a-gunicorn-systemd-service-file) 

### Setting up environment

Use these instructions to setup a new production environment from scratch. By following these instructions you will create a dedicated user _wtc-console_ for running this application with Gunicorn, update proxy config for Nginx and setup firewall to allow traffic on port 80.

#### Create user and login with it

* `sudo useradd wtc-console`
* `sudo su - wtc-console`

#### Get the sources

Clone this project to wtc-console users home directory.

* `git clone https://github.com/vined/wtc-console.git`
* `cd wtc-console/`

#### Prerequisites:
- Python >=2.7
- Node and NPM

#### Install Node and NPM
Follow this guide for [RHEL](https://tecadmin.net/install-latest-nodejs-and-npm-on-centos/)

#### Install Oracle client

Follow instructions on [Oracle client site](https://www.oracle.com/downloads/index.html)

Open wtc-console users .bashrc file: 

`vim ~/.bashrc`

Add these lines to it:

```
export ORACLE_HOME=/usr/lib/oracle/12.2/client64
export LD_LIBRARY_PATH=$ORACLE_HOME/lib
export PATH=$PATH:$ORACLE_HOME/bin
```

And apply these changes:

`. ~/.bashrc `

#### Install RabbitMQ

For installation details please refer to [RabbitMQ installation guide](https://www.rabbitmq.com/install-rpm.html)

#### Create virtual python environment

* `pip install --upgrade pip`
* `pip install virtualenv`
* `virtualenv wtc-console-env`

#### Install and configure nginx

* `sudo yum install epel-release`
* `sudo yum install nginx`

Add following lines to _/etc/nginx/nginx.conf_ as a first _server_ entry and change **domain_name** to the actual domain name probably in format of _node_name.cern.ch_
```
server {
    listen 80;
    server_name domain_Name;
    location = /favicon.ico { access_log off; log_not_found off; }
    location / {
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://0.0.0.0:8000;
    }
}
```

Test if configuration is valid

* `sudo nginx -t`

Set restart nginx and set it to run on startup

* `sudo systemctl start nginx`
* `sudo systemctl enable nginx`

##### For RHEL, Fedora, CentOS

If when opening server you see this error in _/var/log/nginx/error.log_:

```
*2 connect() to 127.0.0.1:8000 failed (13: Permission denied) while connecting to upstream, client: some_ip, server: some_domain, request: "GET / HTTP/1.1", upstream: "http://127.0.0.1:8000/", host: "some_domain"
```

Then use this command to solve it:
* `sudo setsebool -P httpd_can_network_connect 1`

It turns on httpd connections and -P makes it persistent.


#### Give nginx group rights to the project directory

* `sudo chown -R wtc-console:nginx /home/wtc-console/wtc-console`
* `sudo chmod 770 /home/wtc-console/wtc-console`

#### Firewall config

Ask system administrators to include port 80 to puppt config. If puppet is not used, then you can configure firewall yourself to bypass traffic on this port with these commands:

* `sudo iptables -I INPUT 1 -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT`
* `sudo iptables -I OUTPUT 1 -p tcp --dport 80 -m state --state NEW,ESTABLISHED -j ACCEPT`
* `sudo service iptables save`
* `sudo service iptables restart`

You can see current config with `sudo sudo iptables --line -vnL` or `sudo less /etc/sysconfig/iptables`

#### Update production settings

Create prod.py in `src/djangoreactredux/settings/` directory by using _prod_template.py_ settings template file and update the fields with prod values.

* `cp src/djangoreactredux/settings/prod_template.py src/djangoreactredux/settings/prod.py`
* `vim src/djangoreactredux/settings/prod.py`
 
 Create certificates.


Proceed to deployment steps.


### Deployment


Become wtc-console user:

`sudo su - wtc-console`

Deployment is done with one bash command. It will:
* shutdown celery workers
* shutdown current application if running
* pull latest changes from repository master branch
* install missing dependencies
* build frontend app
* start the application
* start celery workers

`./src/bin/deploy_prod.sh`


### Stopping server

If for some reason application should be stoppet then use this script:

`./src/bin/stop_prod.sh`

It will stop Gunicorn and Celery tasks

### Maintenance

Logs are in /home/wtc-console/wtc-console/logs
