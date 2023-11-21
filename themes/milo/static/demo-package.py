"""Demo Supermodule

This is the supermodule of the demo package.
"""

# Start 1 

def demo_function(arg1, arg2):
    """Demo Function

    This function takes two arguments and returns their sum.

    Args:
        arg1 (int): The first argument.
        arg2 (int): The second argument.

    Returns:
        int: The sum of arg1 and arg2.
    """
    return arg1 + arg2

# End 1

class DemoClass:
    """Demo Class

    This is a demo class with a single method.
    """

    def __init__(self, value):
        """Constructor

        Initializes an instance of DemoClass with a value.

        Args:
            value (int): The initial value.
        """
        self.value = value

    def demo_method(self, increment):
        """Demo Method

        This method increments the value of the instance.

        Args:
            increment (int): The amount to increment the value by.
        """
        self.value += increment

def demo_submodule_function():
    """Demo Submodule Function

    This is a function defined in the submodule of the demo package.
    It does not take any arguments and does not return anything.
    """
    pass

