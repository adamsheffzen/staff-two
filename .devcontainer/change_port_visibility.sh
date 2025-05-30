#!/bin/bash

# Function to change port visibility
change_port_visibility() {
  local port1=$1
  local port2=$2
  local visibility=public
  gh codespace ports visibility $port1:$visibility -c $CODESPACE_NAME
  gh codespace ports visibility $port2:$visibility -c $CODESPACE_NAME
}