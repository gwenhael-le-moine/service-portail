source 'https://rubygems.org'

gem 'puma'
gem 'rack'
gem 'rake'
gem 'rest-client'
gem 'sinatra'
gem 'sinatra-contrib'

group :development do
  gem 'capybara'
  gem 'css2less'
  gem 'poltergeist'
  gem 'pry'
  gem 'rspec'
  gem 'rubocop'
  gem 'sass'
  gem 'therubyracer' # used when no node.js is install on computer
end
