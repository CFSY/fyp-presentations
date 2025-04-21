---
# You can also start simply with 'default'
theme: seriph
transition: none
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: Exploring Python Metaprogramming
info: |
    ## FYP CA Presentation "Exploring Python Metaprogramming" by Foo Shi Yu
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
    persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
# transition: fade
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
# take snapshot for each slide in the overview
overviewSnapshots: true
colorSchema: "light"
highlighter: shiki
routerMode: hash
---

# Exploring Python Metaprogramming

by Foo Shi yu

<!-- <div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/slidevjs/slidev" target="_blank" alt="GitHub" title="Open in GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div> -->

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->
---

# Table of contents

- Introduction
- Brief overview of metaprogramming
- Analysis of Open Source Projects
  - Stateflow
  - SGLang
- A Framework Example
  - Architecture and features
  - Demo
- Future Directions

---
layout: default
---

# Introduction

## Visions of a Framework

- Design and implement a next-generation distributed streaming framework
- Support applications in data analysis and machine learning
- Enable efficient, scalable, and stateful processing of streaming data


## Python as a Language Choice

- Python has emerged as a dominant programming language in data analytics and machine learning
- **Python's strengths**: simplicity, readability, and extensive ecosystem
- Unique **metaprogramming** capabilities


<!--
Also mention that metaprogramming is not the best documented thing out there, there are few resources that goes deep into complex usage of metaprogamming. books exist (cite some examples) but they are not sufficient to guide us in building a framework.
So a big focus of this project is to explore the use of metaprogramming in other frameworks to learn from them. And also to implement a simple system ourselves to identify the good and bad practices.
-->

---
layout: default
---

# Introduction

## Core Focus

- Learn how to effectively leverage metaprogramming in framework design
  - Analysis of existing frameworks that utilise metaprogramming
  - Independent experimentation


- Document and showcase enhancement of complex  systems through metaprogramming
  - Detailed documentation of techniques and design patterns
  - Example framework incorporating the techniques



<!--
Also mention that metaprogramming is not the best documented thing out there, there are few resources that goes deep into complex usage of metaprogamming. books exist (cite some examples) but they are not sufficient to guide us in building a framework.
So a big focus of this project is to explore the use of metaprogramming in other frameworks to learn from them. And also to implement a simple system ourselves to identify the good and bad practices.
-->

---
layout: default
---

# Constraints and Assumptions

## Key Challenges

- Undefined framework architecture
- Risk of misaligned exploration
- Balancing metaprogramming complexity with code maintainability


## Project Assumptions

- Python chosen for its ecosystem strength in data analytics/ML
- Metaprogramming patterns can be successfully transferred to new framework


<!--
mention that the original hope was to create a very general framework so that we can simply plug things in and have it work without much tweaking
Foudn pretty quickly through the analysis of other frameworks that this is going to be difficult since a lot of the patterns are coupled with the specific framework.
changed the goal to creating a framework example with as little overhead as possible to prevent masking the pure concepts and patterns
-->
---
layout: center
class: text-center
---

# Brief Overview of Metaprogramming


---
layout: default
---

# Understanding Decorators

- Syntactic sugar for function wrapping
- Functions and classes are objects in Python

<br/>

```python
@some_decorator
def some_func(args, *kwargs):
    pass
```

Is equivalent to


```python
some_func = some_decorator(some_func)
```

---

# Understanding Decorators

<div grid="~ cols-2 gap-4">
<div>

```python
from functools import wraps
import random
import time

def wait_random(min_wait=1, max_wait=30):
    def inner_function(func):
        @wraps(func)
        def wrapper(args, **kwargs):
            time.sleep(random.randint(min_wait, max_wait))
            return func(args, **kwargs)

        return wrapper

    return inner_function

@wait_random(10, 15)
def delayed_function:
	  # delayed code
```

</div>
<div>

- We can also create decorators that accept arguments

- In this example, `inner_function` is the actual decorator

- `@wraps` copies the metadata of the func
  - metadata includes things like name, doc string, and function attributes

</div>
</div>

---

# Understanding Decorators

- Similarly, classes can also be wrapped


```python
def classwrapper(cls):
    for name, val in vars(cls).items():
        #callable return True if the argument is callable
        #i.e. implements the __call
        if callable(val):
            #instead of val, wrap it with our decorator.
            setattr(cls, name, wait_random()(val))
    return cls
```

- All methods of a class wrapped by classwrapper will be randomly delayed

---

# Understanding Metaclasses

<div grid="~ cols-2 gap-4">
<div>

- Generally involves 2 steps
  - Write a new metaclass that is a subclass of type (inherit the type metaclass)
  - Insert the new metaclass into the class creation process


</div>
<div>

```python
class Meta(type):
    pass

class MyClass(metaclass=Meta):
    pass

class MySubclass(MyClass):
    pass
```

</div>
</div>

---

# Understanding Metaclasses

```python
def camel_to_snake(name):
    import re
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

class SnakeCaseMetaclass(type):
    def __new__(snakecase_metaclass, future_class_name,
                future_class_parents, future_class_attr):
        snakecase_attrs = {}
        for name, val in future_class_attr.items():
            snakecase_attrs[camel_to_snake(name)] = val
        return type(future_class_name, future_class_parents,
                    snakecase_attrs)
```

- In this example, the `__new__` magic method is overridden to rename attributes during the creation of the class instance.
  -  `__new__` is the first step in instantiation and is responsible for returning a new instance of the class. `__init__` runs after the instance has been created.


---
layout: center
class: text-center
---

# Analysis of Open Source Projects
## stateflow

---

# Introduction

<img border="rounded" src="/images/calls.png" alt="">

- A framework transforming object-oriented Python classes into distributed dataflows.
- Enables stateful operations for cloud applications.
- Simplifies developer tasks through Python class annotations with `@stateflow`.


---

# Stateflow- Decorators for Class Transformation

<div grid="~ cols-2 gap-4">
<div>

```python
registered_classes: List[ClassWrapper] = []
meta_classes: List = []
  
def stateflow(cls, parse_file=True):
    # Parse source with libcst...
    # Extract class description...
    # Create ClassDescriptor...

    # Register the class
    registered_classes.append(ClassWrapper(cls, class_desc))

    # Create a meta class
    meta_class = MetaWrapper(
        str(cls.__name__),
        tuple(cls.__bases__),
        dict(cls.__dict__),
        descriptor=class_desc,
    )
    meta_classes.append(meta_class)

    return meta_class
```

</div>
<div>

- Uses libcst³ for parsing the class’s source code.

- Generates an Abstract Syntax Tree (AST) from the class code.

- Analyzes the AST to extract metadata like methods and state variables.

- Registers the class after metadata extraction.
  - Applies MetaWrapper metaclass.

- Replaces the original class with the newly transformed version.

</div>
</div>

---

# Metaclasses for Method Interception

<div grid="~ cols-2 gap-4">
<div>

```python
class MetaWrapper(type):
    def __new__(msc, name, bases, dct, descriptor: ClassDescriptor = None):
        msc.client: StateflowClient = None
        msc.asynchronous: bool = False
        dct["descriptor"]: ClassDescriptor = descriptor
        return super(MetaWrapper, msc).__new__(msc, name, bases, dct)

    def __call__(msc, *args, **kwargs) -> Union[ClassRef, StateflowFuture]:
        if "__call__" in vars(msc):
            return vars(msc)["__async_call__"](args, kwargs)

        if "__key" in kwargs:
            return ClassRef(
                FunctionAddress(FunctionType.create(msc.descriptor), kwargs["__key"]),
                msc.descriptor,
                msc.client,
            )
        ...
        # Creates a class event.
        create_class_event = Event(
            event_id, fun_address, EventType.Request.InitClass, payload
        )
        return msc.client.send(create_class_event, msc)
```

</div>
<div>

- Overriden `__call__` method intercepts instance creation.
- `__key` in kwargs is an internal marker denoting whether an instance has been created on server.
  - If it already exists on the server, a ClassRef is returned to the client.
  - Otherwise, a call is sent to the server to create the class instance.

</div>
</div>

---

# AST Manipulation for Metadata Extraction

<div grid="~ cols-2 gap-4">
<div class="code-container">

```python
class ExtractClassDescriptor(cst.CSTVisitor):
    def __init__(
        self, module_node: cst.CSTNode, decorated_class_name: str, expression_provider
    ):
      ...

    def visit_FunctionDef(self, node: cst.FunctionDef) -> Optional[bool]:
        """Visits a function definition and analyze it.

        Extracts the following properties of a function:
        1. The declared self variables (i.e. state).
        2. The input variables of a function.
        3. The output variables of a function.
        4. If a function is read-only.
        """

    def visit_ClassDef(self, node: cst.ClassDef) -> Optional[bool]:
        """Extracts class name and prevents nested classes."""

    def merge_self_attributes(self) -> Dict[str, any]:
        """Merges all self attributes."""

    @staticmethod
    def create_class_descriptor(
        analyzed_visitor: "ExtractClassDescriptor",
    ) -> ClassDescriptor:
        state_desc: StateDescriptor = StateDescriptor(
            analyzed_visitor.merge_self_attributes()
        )
        return ClassDescriptor(
            class_name=analyzed_visitor.class_name,
            module_node=analyzed_visitor.module_node,
            class_node=analyzed_visitor.class_node,
            state_desc=state_desc,
            methods_dec=analyzed_visitor.method_descriptors,
            expression_provider=analyzed_visitor.expression_provider,
        )
```

</div>
<div>

- The `ExtractClassDescriptor` class uses `CSTVisitor` from libcst to analyze a Python class’s source
  code and extract metadata
- Visits class and function definitions within the AST of the code to gather key information
- After parsing all relevant elements, it merges state attributes and generates a ClassDescriptor, encapsulating the class metadata

</div>
</div>

<style>
.code-container {
  max-height: 450px;
  overflow: auto;
}
</style>

---
layout: center
class: text-center
---

# Analysis of Open Source Projects
## SGLang

---
layout: default
---

# Introduction

- SGLang introduces a domain-specific language (DSL) to facilitate advanced prompting workflows, particularly for natural language processing tasks.
- It uses metaprogramming to implement its DSL, enabling the construction of computational graphs from high-level code and allowing for features like parallel execution and state management.

```python
@function
def multi_dimensional_judge(s, path, essay): 
	s += system("Evaluate an essay about an image.")
	s += user(image(path) + "Essay:" + essay)
	s += assistant("Sure!")
	
	# Return directly if it is not related
	s += user("Is the essay related to the image?")
	s += assistant(select("related", choices=["yes", "no"]))
	if s["related"] == "no": return
  # ...

state = multi_dimensional_judge.run(...)
print(state["output"])
```

---

# Custom Expression Classes and Operator Overloading

<div grid="~ cols-2 gap-4">
<div>

```python
class SglExpr:
    def __add__(self, other):
        if isinstance(other, str):
            other = SglConstantText(other)
        return SglExprList([self, other])

class SglConstantText(SglExpr):
    def __init__(self, text):
        super().__init__()
        self.text = text
```

```python
s += system("Evaluate an essay about an image.")
s += user(image(path) + "Essay:" + essay)
```

</div>
<div> 

- The `SglExpr` class serves as the base for all expressions in the DSL, providing essential structure for expression representation.
- By implementing operator overloading, specifically through the `__add__` method, SglExpr enables expressions to
  be combined using the `+` operator.

- The expressions within `user(...)` are combined using the `+` operator.
- Each component in `(image(path), "Essay:", essay)` is an `SglExpr`

</div>
</div>

---

# Custom Expression Classes and Operator Overloading

<div grid="~ cols-2 gap-4">
<div>

```python
def function(func=None):
    if func:
        return SglFunction(func)           
    def decorator(func):
        return SglFunction(func)
    return decorator
```

```python
class SglFunction:
    def trace(self, *, backend=None, **kwargs):
        from sglang.lang.tracer import trace_program
        backend = backend or global_config.default_backend
        return trace_program(self, kwargs, backend)

    def __call__(self, *args, **kwargs):
        from sglang.lang.tracer import TracingScope
        tracing_scope = TracingScope.get_current_scope()
        if tracing_scope is None:
            return self.run(*args, **kwargs)
        else:
            kwargs["backend"] 
                = tracing_scope.tracer_state.backend
            return self.trace(*args, **kwargs)
```

</div>
<div> 

- When a function is decorated with `@function`, the decorator transforms the regular function into an `SglFunction` object.

<br/>

- `__call__` is overridden allowing the class to intercept execution.
- Depending on whether the tracing process is complete or not, the class either runs the function or continues the trace.

</div>
</div>

---

# Building a Computational Graph

<div grid="~ cols-2 gap-4">
<div>

```python
def trace_program(program, arguments, backend):
    #...
    # Trace
    tracer = TracerProgramState(backend, arguments, only_trace_prefix=False)
    with TracingScope(tracer):
        tracer.ret_value = program.func(tracer, **arguments)
    return tracer

class TracerProgramState(ProgramState):
    def __iadd__(self, other):
        self._execute(other)
        return self

    def _execute(self, other):
        if isinstance(other, SglExpr):
            self.nodes.append(other)
```

</div>
<div> 

- From `SglFunction`, the `self.trace` call leads to the execution of `trace_program`

- The tracer's operation interception works by overriding the `__iadd__` method to capture `+=` operations
- This prevents their immediate execution, and instead records the expressions in `self.nodes`.
- This recording process effectively builds a computational graph from the collected expressions.

</div>
</div>

---

# Learning from the Analysis

- Use of Intermediate Representations (IR)
  - Both projects utilize IR to abstract the behavior of the system
  - Stateflow constructs a dataflow graph representing classes and methods as distributed operators
  - SGLang builds a computational graph from traced expressions to represent execution flow

- Metaprogramming Techniques
  - Decorators are used to transform and enhance classes and functions
  - Metaclasses and operator overloading are used to control instance creation and enable natural syntax
  - AST manipulation is used to analyze and record code structures and execution for dynamic behavior

---

# Learning from the Analysis

- Implications for Framework Design
  - Metaprogramming effectively abstracts the complexity of distributed systems, making them more accessible to developers.
  - The use of operator overloading and decorators leads to more intuitive and expressive interfaces
  - AST manipulation and execution tracing enable dynamic adaptation of code, particularly beneficial in distributed environments.

---
layout: center
class: text-center
---

# A Framework Example

---
layout: default
---

# Overview

- The framework allows developers to define computational tasks using simple Python functions and execute them in a distributed manner.
- The system leverages metaprogramming to transform simple function definitions into distributed tasks with minimal boilerplate code.

<div grid="~ cols-2 gap-4">
<div>

Consider this simple task definition:

```python
@task
def add_numbers(a: int, b: int) -> int:
    """Add two numbers together"""
    return a + b
```

</div>
<div> 

<br/><br/>
This seemingly simple code triggers a chain of metaprogramming operations at runtime

</div>
</div>

---

# Overview

<div grid="~ cols-2">
<div>

<img border="rounded" src="/images/diagrams/flow.png" alt="" width="300px">

</div>
<div> 

1. A new task class is created in place of the function

<br/>

2. The metadata of the function is preserved and stored in a task registry

<br/>

3. Type information is extracted for runtime validation

<br/>

4. Custom worker code is generated for distributed execution of tasks

</div>
</div>

---
layout: center
class: text-center
---

# Demo

---

# Under the Hood

<div grid="~ cols-2">
<div>

<img border="rounded" src="/images/diagrams/architecture.png" alt="" width="380px">

</div>
<div> 

1. An execution request is sent from the web UI to the server
2. The execution manager receives the request and code generation
3. Custom worker code is generated, containing only code relevant to the task being executed
4. Docker container orchestration configurations are generated and executed
5. The task is executed on the worker container
6. Meanwhile, the web UI automatically polls for the execution results and status
7. Execution is completed and everything is cleaned up

</div>
</div>

---

# Metaclasses and Class Generation

<div grid="~ cols-2 gap-4">
<div>

When a function is decorated with `@task`, the following code will run:

```python
def task(func):
      """Decorator to create a task class from a function"""
      @wraps(func)
      def wrapper(*args, **kwargs):
          return func(*args, **kwargs)
      # Create a new task class dynamically
      task_name = f"{func.__name__.title()}Task"
      class DynamicTask(metaclass=Task):
          execute = staticmethod(func)
          __module__ = func.__module__

      DynamicTask.__name__ = task_name
      return DynamicTask
```

</div>
<div> 

<br/><br/>
- This creates a new class that inherits the Task metaclass that the framework defined.

- The original function is also stored in the execute attribute of the class for later analysis and use.

</div>
</div>

---

# Metaclasses and Class Generation

<div grid="~ cols-2 gap-4">
<div class="code-container">

```python
class Task(type):
    """Task metaclass for creating task definitions"""
    _registry = {}
    def __new__(cls, name, bases, attrs):
        new_cls = super().__new__(cls, name, bases, attrs)
        if 'execute' in attrs:
            metadata = TaskMetadata(attrs['execute'])
            new_cls._metadata = metadata
            Task._registry[metadata.id] = new_cls
        return new_cls

class TaskMetadata:
    def __init__(self, func):
        self.func = func
        self.id = str(uuid.uuid4())
        self.name = func.__name__
        self.signature = inspect.signature(func)
        self.doc = func.__doc__ 
            or "No description available"
        
    @property
    def input_schema(self) -> Dict[str, Type]:
      return {
        name: param.annotation
          if param.annotation != inspect.Parameter.empty
          else Any
        for name, param in 
            self.signature.parameters.items()
      }
```

</div>
<div> 

The metaclass serves multiple purposes:
- Maintains a global registry of all tasks
- Provides introspection capabilities through the TaskMetadata class
- Allows enforcement of task interface requirements with `input_schema`
- Enables runtime modification of task behavior

</div>
</div>

<style>
.code-container {
  max-height: 450px;
  overflow: auto;
}
</style>

---

# Type Annotations and Runtime Reflection

<div grid="~ cols-2 gap-4">
<div>

```python
class TaskAnalyzer:
    @staticmethod
    def analyze_task(task_cls: Type) -> Dict:
        if not hasattr(task_cls, '_metadata'):
            raise ValueError(f"Invalid task class: {task_cls}")
        metadata = task_cls._metadata
        source = inspect.getsource(metadata.func)
        
        # Extract type information and validate
        input_schema = metadata.input_schema
        for param_name, param_type in input_schema.items():
            if param_type == inspect.Parameter.empty:
                raise ValueError(f"Missing type annotation for parameter: {param_name}")
        return {
            'id': metadata.id,
            'name': metadata.name,
            'source': clean_source,
            'input_schema': metadata.input_schema,
            'doc': metadata.doc
        }
```

</div>
<div> 

The `TaskAnalyzer` analyzes task definitions and extracts metadata for usage throughout the framework

</div>
</div>

---

# Dynamic Code Generation

<div grid="~ cols-2 gap-4">
<div class="code-container">

```python
class WorkerCodeGenerator:
    def __init__(self, template_dir: Optional[Path] = None, output_dir: Optional[Path] = None):
        self.template_dir = template_dir or Path(__file__).parent.parent / "workers" / "templates"
        self.output_dir = output_dir or Path(__file__).parent.parent / "generated"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.env = jinja2.Environment( loader=jinja2.FileSystemLoader(str(self.template_dir)), trim_blocks=True, lstrip_blocks=True, keep_trailing_newline=True)

    def generate_worker_code(self, task_metadata: Dict, executor_type: str) -> str:
        if not all(k in task_metadata for k in ['id', 'name', 'source']):
            raise ValueError("Missing required task metadata fields")

        # Create executor-specific subfolder
        executor_dir = self.output_dir / executor_type
        executor_dir.mkdir(parents=True, exist_ok=True)

        template = self.env.get_template("worker_template")

        worker_code = template.render(
            task_id=task_metadata['id'],
            task_name=task_metadata['name'],
            task_source=task_metadata['source'],
            task_doc=task_metadata.get('doc', ''),
            input_schema=task_metadata.get('input_schema', {}),
            executor_type=executor_type
        )

        output_path = executor_dir / f"worker_{task_metadata['id']}.py"
        output_path.write_text(worker_code)

        return str(output_path)
```

</div>
<div> 

Jinja2 templates were used for code generation

This approach allows for:
- Optimal worker code with minimal dependencies
- Environment-specific optimizations
- Runtime code modification based on execution context

</div>
</div>

<style>
.code-container {
  max-height: 450px;
  overflow: auto;
}
</style>

---

# Demo Insights

- The demo showed how metaprogramming can bridge the gap between simplicity and complexity

- The techniques explored here represent just the beginning of what's possible

- As we look toward implementing more complex features like workflow orchestration, dependency management, and distributed computing patterns, these metaprogramming patterns will prove invaluable in maintaining clean APIs while handling increasing complexity under the hood

---
layout: center
---

# Future Directions

---

# Future Directions

1. *Advanced DSL Development*
- Create a declarative DSL for defining task workflows, dependencies, and execution patterns.
- Explore alternatives for implementing a DSL like chainable APIs or context managers.

<br/>

2. *AST-Based Optimization*
- Automatic parallelization through code analysis
- Dead code elimination
- Resource usage optimization

---

# Future Directions

3. *Dynamic Protocol Generation*
- Automatic API generation, maybe even for different communication protocols
- Runtime protocol negotiation and adaptation

<br/>

4. *Documentation and Knowledge Base*
- Comprehensive documentation of metaprogramming patterns
- Best practices and anti-patterns
- Performance implications and trade-offs
- Case studies and practical examples

---
layout: center
---

# Q&A

---
layout: center
---

# Thank You