#- -*- coding: utf-8 -*-

require 'logger'

# DIR Method
def __DIR__(*args)
  filename = caller[0][/^(.*):/, 1]
  dir = File.expand_path(File.dirname(filename))
  ::File.expand_path(::File.join(dir, *args.map(&:to_s)))
end

# puts 'loading config/common'
# require __DIR__('common')

puts 'loading config/options'
require __DIR__('options')
