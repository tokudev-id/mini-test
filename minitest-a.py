from math import isqrt

def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    limit = isqrt(n)
    f = 5
    while f <= limit:
        if n % f == 0 or n % (f + 2) == 0:
            return False
        f += 6
    return True

def transform(n: int):
    if is_prime(n):
        return None  # skip prime numbers.
    out = ""
    if n % 3 == 0:
        out += "Foo" # Replace numbers divisible by 3 with the text "Foo"
    if n % 5 == 0:
        out += "Bar" # Replace numbers divisible by 5 with the text "Bar"
    return out if out else str(n)

values = []
for x in range(100, 0, -1):
    t = transform(x)
    if t is not None:
        values.append(t)

print(", ".join(values))
