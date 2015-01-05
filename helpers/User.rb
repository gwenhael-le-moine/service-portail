# -*- encoding: utf-8 -*-

require_relative '../lib/HashedUser'

module Portail
  module Helpers
    module User
      def user
        HashedUser.new session[:current_user]
      end
    end
  end
end
