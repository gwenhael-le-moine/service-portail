# -*- encoding: utf-8 -*-

require_relative './app'

map "#{APP_PATH}/" do
  run SinatraApp
end
