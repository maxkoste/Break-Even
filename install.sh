#! /bin/bash
# install script for unix systems, requires python3 !
python3 -m venv .venv

source .venv/bin/activate

pip3 install -r requirements.txt
