#!/bin/sh
# Author : ST
# Script follows here:
# nohup bash build_test.sh & nohup bash run_behave.sh &
cd tests
behave
# behave -n "Verify the rich data items are displayed"
# behave -i tutorial.feature